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
);

CREATE TABLE IF NOT EXISTS claim_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  claim_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(50) NOT NULL,
  comment TEXT NULL,
  blockchain_tx_hash VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_claim_history_claim_id (claim_id)
);
