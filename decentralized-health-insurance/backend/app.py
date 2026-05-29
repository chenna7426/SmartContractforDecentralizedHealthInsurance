import os

import bcrypt
import jwt
import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes (fixes frontend network error on /register and /login)
CORS(app)

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Snehith7427",
    "database": "health_insurance",
    "cursorclass": pymysql.cursors.DictCursor,
}

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "change-me")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")


def get_connection():
    connection = pymysql.connect(**DB_CONFIG)
    return connection


def get_bearer_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    return auth_header.split(" ", 1)[1].strip()


def get_current_admin_user():
    token = get_bearer_token()
    if not token:
        return None, "Missing bearer token"

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None, "Invalid authentication token"

    user_id = payload.get("sub")
    if not user_id:
        return None, "Invalid authentication token"

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user or (user.get("role") or "").lower() != "admin":
        return None, "Admin access required"

    return user, None


def get_current_user():
    token = get_bearer_token()
    if not token:
        return None, "Missing bearer token"

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None, "Invalid authentication token"

    user_id = payload.get("sub")
    if not user_id:
        return None, "Invalid authentication token"

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        return None, "User not found"

    return user, None


def ensure_schema():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'Patient',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS claims (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            hospital_name VARCHAR(100) NULL,
            claim_amount DECIMAL(10,2) NULL,
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            wallet_address VARCHAR(255) NULL,
            patient_name VARCHAR(100) NULL,
            policy_number VARCHAR(100) NULL,
            claim_type VARCHAR(100) NULL,
            diagnosis VARCHAR(200) NULL,
            description TEXT NULL,
            evidence_url VARCHAR(255) NULL,
            blockchain_claim_id BIGINT NULL,
            blockchain_tx_hash VARCHAR(100) NULL,
            admin_notes TEXT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS claim_history (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            claim_id INT NOT NULL,
            status VARCHAR(50) NOT NULL,
            changed_by VARCHAR(50) NOT NULL,
            comment TEXT NULL,
            blockchain_tx_hash VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_claim_history_claim_id (claim_id)
        )
        """
    )

    columns = {}
    cursor.execute("SHOW COLUMNS FROM claims")
    for row in cursor.fetchall():
        columns[row["Field"]] = row["Type"]

    additions = [
        ("wallet_address", "VARCHAR(255) NULL"),
        ("patient_name", "VARCHAR(100) NULL"),
        ("policy_number", "VARCHAR(100) NULL"),
        ("claim_type", "VARCHAR(100) NULL"),
        ("diagnosis", "VARCHAR(200) NULL"),
        ("description", "TEXT NULL"),
        ("evidence_url", "VARCHAR(255) NULL"),
        ("blockchain_claim_id", "BIGINT NULL"),
        ("blockchain_tx_hash", "VARCHAR(100) NULL"),
        ("admin_notes", "TEXT NULL"),
        ("updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    ]

    for column_name, definition in additions:
        if column_name not in columns:
            cursor.execute(f"ALTER TABLE claims ADD COLUMN {column_name} {definition}")

    user_columns = {}
    cursor.execute("SHOW COLUMNS FROM users")
    for row in cursor.fetchall():
        user_columns[row["Field"]] = row["Type"]

    if "role" not in user_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'Patient'")

    connection.commit()
    cursor.close()
    connection.close()


def serialize_claim(claim):
    if claim is None:
        return None

    serialized = dict(claim)
    if serialized.get("claim_amount") is not None:
        serialized["claim_amount"] = float(serialized["claim_amount"])
    return serialized


ensure_schema()


@app.errorhandler(Exception)
def handle_exception(error):
    return jsonify({
        "success": False,
        "error": str(error),
    }), 500


@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "message": "Flask backend and claim workflow are running",
    })


def create_access_token(user):
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "role": user.get("role") or "Patient",
        "name": user["name"],
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role") or "Patient"

    if not all([name, email, password]):
        return jsonify({"success": False, "error": "name, email and password are required"}), 400

    connection = get_connection()
    cursor = connection.cursor()

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    try:
        cursor.execute(
            "INSERT INTO users(name, email, password, role) VALUES(%s, %s, %s, %s)",
            (name, email, hashed_password, role),
        )
        connection.commit()
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
    except Exception as error:
        connection.rollback()
        cursor.close()
        connection.close()
        return jsonify({"success": False, "error": str(error)}), 400

    cursor.close()
    connection.close()

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "access_token": create_access_token(user),
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role") or "Patient",
        },
    })


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return jsonify({"success": False, "error": "email and password are required"}), 400

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()
        return jsonify({"success": False, "message": "User not found"}), 404

    password_match = bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8"))
    cursor.close()
    connection.close()

    if not password_match:
        return jsonify({"success": False, "message": "Invalid password"}), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": create_access_token(user),
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role") or "Patient",
        },
    })


@app.route("/auth/register", methods=["POST"])
def auth_register():
    return register()


@app.route("/auth/login", methods=["POST"])
def auth_login():
    return login()


@app.route("/api/claims", methods=["POST"])
def create_claim():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "patientName",
        "policyNumber",
        "claimType",
        "amount",
        "hospitalName",
        "diagnosis",
        "description",
        "walletAddress",
    ]

    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"success": False, "error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    try:
        claim_amount = float(data.get("amount"))
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "Claim amount must be a valid number"}), 400

    if claim_amount <= 0:
        return jsonify({"success": False, "error": "Claim amount must be greater than zero"}), 400

    blockchain_claim_id = data.get("blockchainClaimId") or data.get("blockchain_claim_id")
    blockchain_tx_hash = data.get("blockchainTxHash") or data.get("blockchain_tx_hash")

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO claims (
            user_id,
            wallet_address,
            patient_name,
            policy_number,
            claim_type,
            claim_amount,
            hospital_name,
            diagnosis,
            description,
            evidence_url,
            status,
            blockchain_claim_id,
            blockchain_tx_hash
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data.get("userId"),
            data.get("walletAddress"),
            data.get("patientName"),
            data.get("policyNumber"),
            data.get("claimType"),
            claim_amount,
            data.get("hospitalName"),
            data.get("diagnosis"),
            data.get("description"),
            data.get("evidenceUrl") or "",
            "Pending",
            blockchain_claim_id,
            blockchain_tx_hash,
        ),
    )

    claim_id = cursor.lastrowid

    cursor.execute(
        """
        INSERT INTO claim_history (
            claim_id,
            status,
            changed_by,
            comment,
            blockchain_tx_hash
        ) VALUES (%s, %s, %s, %s, %s)
        """,
        (
            claim_id,
            "Pending",
            "user",
            "Claim submitted from frontend",
            blockchain_tx_hash,
        ),
    )

    connection.commit()
    cursor.execute("SELECT * FROM claims WHERE id=%s", (claim_id,))
    claim = cursor.fetchone()
    cursor.close()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Claim stored successfully",
        "claim": serialize_claim(claim),
    })


@app.route("/api/claims", methods=["GET"])
def get_claims():
    user, error = get_current_user()
    if error:
        return jsonify({"success": False, "error": error}), 401

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM claims WHERE user_id=%s ORDER BY created_at DESC", (user["id"],))
    claims = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify({
        "claims": [serialize_claim(claim) for claim in claims],
    })


@app.route("/api/claims/<int:claim_id>", methods=["GET"])
def get_claim(claim_id):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM claims WHERE id=%s", (claim_id,))
    claim = cursor.fetchone()
    if not claim:
        cursor.close()
        connection.close()
        return jsonify({"success": False, "error": "Claim not found"}), 404

    cursor.execute("SELECT * FROM claim_history WHERE claim_id=%s ORDER BY created_at ASC", (claim_id,))
    history = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify({
        "success": True,
        "claim": serialize_claim(claim),
        "history": history,
    })


@app.route("/api/claims/<int:claim_id>/history", methods=["GET"])
def get_claim_history(claim_id):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM claim_history WHERE claim_id=%s ORDER BY created_at ASC", (claim_id,))
    history = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify({
        "history": history,
    })


def update_claim_status_record(claim_id, status, admin_notes, blockchain_tx_hash):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "UPDATE claims SET status=%s, admin_notes=%s, blockchain_tx_hash=%s, updated_at=NOW() WHERE id=%s",
        (status, admin_notes, blockchain_tx_hash, claim_id),
    )

    if cursor.rowcount == 0:
        connection.rollback()
        cursor.close()
        connection.close()
        return None

    cursor.execute(
        "INSERT INTO claim_history (claim_id, status, changed_by, comment, blockchain_tx_hash) VALUES (%s, %s, %s, %s, %s)",
        (claim_id, status, "admin", admin_notes, blockchain_tx_hash),
    )

    connection.commit()
    cursor.execute("SELECT * FROM claims WHERE id=%s", (claim_id,))
    claim = cursor.fetchone()
    cursor.close()
    connection.close()

    return claim


def update_claim_status_record_with_chain_id(claim_id, status, admin_notes, blockchain_tx_hash, blockchain_claim_id=None):
    connection = get_connection()
    cursor = connection.cursor()

    # If a blockchain_claim_id is provided, persist it alongside the status update.
    if blockchain_claim_id is not None:
        cursor.execute(
            "UPDATE claims SET status=%s, admin_notes=%s, blockchain_tx_hash=%s, blockchain_claim_id=%s, updated_at=NOW() WHERE id=%s",
            (status, admin_notes, blockchain_tx_hash, blockchain_claim_id, claim_id),
        )
    else:
        cursor.execute(
            "UPDATE claims SET status=%s, admin_notes=%s, blockchain_tx_hash=%s, updated_at=NOW() WHERE id=%s",
            (status, admin_notes, blockchain_tx_hash, claim_id),
        )

    if cursor.rowcount == 0:
        connection.rollback()
        cursor.close()
        connection.close()
        return None

    cursor.execute(
        "INSERT INTO claim_history (claim_id, status, changed_by, comment, blockchain_tx_hash) VALUES (%s, %s, %s, %s, %s)",
        (claim_id, status, "admin", admin_notes, blockchain_tx_hash),
    )

    connection.commit()
    cursor.execute("SELECT * FROM claims WHERE id=%s", (claim_id,))
    claim = cursor.fetchone()
    cursor.close()
    connection.close()

    return claim


@app.route("/api/admin/claims", methods=["GET"])
def get_admin_claims():
    admin_user, error = get_current_admin_user()
    if error:
        return jsonify({"success": False, "error": error}), 401 if "token" in error.lower() or "missing" in error.lower() else 403

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM claims ORDER BY created_at DESC")
    claims = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify({
        "claims": [serialize_claim(claim) for claim in claims],
    })


@app.route("/api/admin/claims/<int:claim_id>/approve", methods=["PUT"])
def approve_admin_claim(claim_id):
    admin_user, error = get_current_admin_user()
    if error:
        return jsonify({"success": False, "error": error}), 401 if "token" in error.lower() or "missing" in error.lower() else 403

    data = request.get_json(silent=True) or {}
    blockchain_tx_hash = data.get("blockchainTxHash") or data.get("blockchain_tx_hash")

    claim = update_claim_status_record_with_chain_id(
        claim_id,
        "Approved",
        data.get("adminNotes") or "Approved via admin panel",
        blockchain_tx_hash,
        data.get("blockchainClaimId") or data.get("blockchain_claim_id"),
    )

    if claim is None:
        return jsonify({"success": False, "error": "Claim not found"}), 404

    return jsonify({
        "success": True,
        "message": "Claim approved",
        "claim": serialize_claim(claim),
    })


@app.route("/api/admin/claims/<int:claim_id>/reject", methods=["PUT"])
def reject_admin_claim(claim_id):
    admin_user, error = get_current_admin_user()
    if error:
        return jsonify({"success": False, "error": error}), 401 if "token" in error.lower() or "missing" in error.lower() else 403

    data = request.get_json(silent=True) or {}
    reason = data.get("reason") or data.get("adminNotes") or "Rejected via admin panel"
    blockchain_tx_hash = data.get("blockchainTxHash") or data.get("blockchain_tx_hash")

    claim = update_claim_status_record_with_chain_id(
        claim_id,
        "Rejected",
        f"Rejected: {reason}",
        blockchain_tx_hash,
        data.get("blockchainClaimId") or data.get("blockchain_claim_id"),
    )

    if claim is None:
        return jsonify({"success": False, "error": "Claim not found"}), 404

    return jsonify({
        "success": True,
        "message": "Claim rejected",
        "claim": serialize_claim(claim),
    })


@app.route("/api/claims/<int:claim_id>/status", methods=["PATCH"])
def update_claim_status(claim_id):
    admin_user, error = get_current_admin_user()
    if error:
        return jsonify({"success": False, "error": error}), 401 if "token" in error.lower() or "missing" in error.lower() else 403

    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ["Approved", "Rejected"]:
        return jsonify({"success": False, "error": "status must be Approved or Rejected"}), 400

    admin_notes = data.get("adminNotes") or data.get("comment") or f"Claim {status.lower()} by admin"
    blockchain_tx_hash = data.get("blockchainTxHash") or data.get("blockchain_tx_hash")

    claim = update_claim_status_record_with_chain_id(claim_id, status, admin_notes, blockchain_tx_hash, data.get("blockchainClaimId") or data.get("blockchain_claim_id"))
    if claim is None:
        return jsonify({"success": False, "error": "Claim not found"}), 404

    return jsonify({
        "success": True,
        "message": f"Claim {status}",
        "claim": serialize_claim(claim),
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", debug=False, use_reloader=False, port=port)
