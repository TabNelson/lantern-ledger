// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LanternLedger {
    mapping(address => uint256) public userLights;
    mapping(address => uint256) public userBells;
    mapping(address => uint256) public userSafes;

    uint256 public totalLights;
    uint256 public totalBells;
    uint256 public totalSafes;

    event BeaconLit(address indexed user, uint256 userLights, uint256 totalLights);
    event BellRung(address indexed user, uint256 userBells, uint256 totalBells);
    event SafetyMarked(address indexed user, uint256 userSafes, uint256 totalSafes);

    function lightBeacon() external {
        unchecked {
            userLights[msg.sender] += 1;
            totalLights += 1;
        }

        emit BeaconLit(msg.sender, userLights[msg.sender], totalLights);
    }

    function ringBell() external {
        unchecked {
            userBells[msg.sender] += 1;
            totalBells += 1;
        }

        emit BellRung(msg.sender, userBells[msg.sender], totalBells);
    }

    function markSafe() external {
        unchecked {
            userSafes[msg.sender] += 1;
            totalSafes += 1;
        }

        emit SafetyMarked(msg.sender, userSafes[msg.sender], totalSafes);
    }
}
