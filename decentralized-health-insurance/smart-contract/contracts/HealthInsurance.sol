// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HealthInsurance {
    enum ClaimStatus {
        Pending,
        Approved,
        Rejected
    }

    struct Claim {
        uint256 id;
        address patient;
        string patientName;
        string policyNumber;
        string claimType;
        uint256 amount;
        string hospitalName;
        string diagnosis;
        string description;
        string evidenceUrl;
        ClaimStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    Claim[] private claims;
    mapping(address => uint256[]) private patientClaims;
    address public admin;

    event ClaimSubmitted(uint256 indexed claimId, address indexed patient);
    event ClaimStatusUpdated(
        uint256 indexed claimId,
        address indexed admin,
        ClaimStatus status
    );

    constructor(address _admin) {
        admin = _admin;
    }

    function submitClaim(
        string memory patientName,
        string memory policyNumber,
        string memory claimType,
        uint256 amount,
        string memory hospitalName,
        string memory diagnosis,
        string memory description,
        string memory evidenceUrl
    ) public returns (uint256) {
        require(bytes(patientName).length > 0, "Patient name is required");
        require(bytes(policyNumber).length > 0, "Policy number is required");
        require(bytes(claimType).length > 0, "Claim type is required");
        require(amount > 0, "Claim amount must be greater than zero");
        require(bytes(hospitalName).length > 0, "Hospital name is required");
        require(bytes(diagnosis).length > 0, "Diagnosis is required");

        uint256 claimId = claims.length;

        claims.push(
            Claim(
                claimId,
                msg.sender,
                patientName,
                policyNumber,
                claimType,
                amount,
                hospitalName,
                diagnosis,
                description,
                evidenceUrl,
                ClaimStatus.Pending,
                block.timestamp,
                block.timestamp
            )
        );

        patientClaims[msg.sender].push(claimId);
        emit ClaimSubmitted(claimId, msg.sender);

        return claimId;
    }

    function updateClaimStatus(uint256 claimId, ClaimStatus status) public {
        require(msg.sender == admin, "Only admin can update claim status");
        require(claimId < claims.length, "Claim does not exist");
        require(claims[claimId].status == ClaimStatus.Pending, "Claim has already been processed");

        claims[claimId].status = status;
        claims[claimId].updatedAt = block.timestamp;

        emit ClaimStatusUpdated(claimId, msg.sender, status);
    }

    function getClaim(uint256 claimId) public view returns (Claim memory) {
        require(claimId < claims.length, "Claim does not exist");
        return claims[claimId];
    }

    function getClaims() public view returns (Claim[] memory) {
        return claims;
    }

    function getPatientClaims(address patient) public view returns (uint256[] memory) {
        return patientClaims[patient];
    }
}