package com.bess.commandcenter.controller;

import com.bess.commandcenter.simulator.SimulatorConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final SimulatorConfig simulatorConfig;

    @GetMapping("/status")
    public SimulatorConfig.SimulatorStatus getStatus() {
        return simulatorConfig.getStatus();
    }

    @PostMapping("/start")
    public ResponseEntity<SimulatorConfig.SimulatorStatus> start() {
        simulatorConfig.setEnabled(true);
        return ResponseEntity.ok(simulatorConfig.getStatus());
    }

    @PostMapping("/stop")
    public ResponseEntity<SimulatorConfig.SimulatorStatus> stop() {
        simulatorConfig.setEnabled(false);
        return ResponseEntity.ok(simulatorConfig.getStatus());
    }

    @PostMapping("/mode")
    public ResponseEntity<SimulatorConfig.SimulatorStatus> setMode(@RequestParam String mode) {
        try {
            SimulatorConfig.SimulatorMode parsed = SimulatorConfig.SimulatorMode.valueOf(mode.toUpperCase());
            simulatorConfig.setMode(parsed);
            return ResponseEntity.ok(simulatorConfig.getStatus());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
