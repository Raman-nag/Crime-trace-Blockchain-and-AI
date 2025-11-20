// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CrimeTrace - PoliceCitizen Connect registry
/// @notice Minimal contract to support role checks and citizen registration for the Crime Trace dApp.
contract CrimeTrace {
    struct Citizen {
        address wallet;
        string aliasName;
        string idType;
        bytes32 idHash;
        string metadata; // JSON string with city/state/pincode/IPFS CID etc.
        bool exists;
    }

    struct Station {
        uint256 id;
        string name;
        address wallet;
        bool active;
    }

    address public platformAdmin;
    uint256 public nextStationId = 1;

    mapping(address => Citizen) private citizens;
    mapping(address => Station) private stations;

    event CitizenRegistered(address indexed wallet, string aliasName, string idType, bytes32 idHash, string metadata);
    event StationRegistered(uint256 indexed id, address indexed wallet, string name);
    event StationStatusUpdated(uint256 indexed id, address indexed wallet, bool active);

    modifier onlyAdmin() {
        require(msg.sender == platformAdmin, "Only platform admin");
        _;
    }

    constructor() {
        platformAdmin = msg.sender;
    }

    // --- Role checks ---

    function isPlatformAdmin(address user) external view returns (bool) {
        return user == platformAdmin;
    }

    function isCitizen(address user) external view returns (bool) {
        return citizens[user].exists;
    }

    function isRegisteredStation(address user) external view returns (bool) {
        return stations[user].active;
    }

    function isRegisteredStation(address user, uint256 stationId) external view returns (bool) {
        Station storage s = stations[user];
        return s.active && s.id == stationId;
    }

    function getStationByWallet(address user) external view returns (uint256 id, string memory name, address wallet, bool active) {
        Station storage s = stations[user];
        require(s.wallet != address(0), "Station not found");
        return (s.id, s.name, s.wallet, s.active);
    }

    // --- Admin station management ---

    function registerStation(address stationWallet, string calldata name) external onlyAdmin returns (uint256) {
        require(stationWallet != address(0), "Invalid wallet");
        require(stations[stationWallet].wallet == address(0), "Station already exists");

        uint256 assignedId = nextStationId++;
        stations[stationWallet] = Station({
            id: assignedId,
            name: name,
            wallet: stationWallet,
            active: true
        });

        emit StationRegistered(assignedId, stationWallet, name);
        return assignedId;
    }

    function setStationStatus(address stationWallet, bool active) external onlyAdmin {
        Station storage s = stations[stationWallet];
        require(s.wallet != address(0), "Station not found");
        s.active = active;
        emit StationStatusUpdated(s.id, stationWallet, active);
    }

    // --- Citizen registration ---

    function registerCitizen(
        string calldata aliasName,
        string calldata idType,
        bytes32 idHash,
        string calldata metadata
    ) external {
        require(!citizens[msg.sender].exists, "Citizen already registered");
        require(bytes(idType).length > 0, "ID type required");
        require(idHash != bytes32(0), "ID hash required");

        citizens[msg.sender] = Citizen({
            wallet: msg.sender,
            aliasName: aliasName,
            idType: idType,
            idHash: idHash,
            metadata: metadata,
            exists: true
        });

        emit CitizenRegistered(msg.sender, aliasName, idType, idHash, metadata);
    }
}
