package com.bess.commandcenter.simulator;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Data
@Component
public class SimulatorConfig {

    public enum SimulatorMode {
        STEADY, LIVE
    }

    // Thread-safe toggles
    private final AtomicBoolean enabled = new AtomicBoolean(true);
    private final AtomicReference<SimulatorMode> mode = new AtomicReference<>(SimulatorMode.STEADY);

    public boolean isEnabled() {
        return enabled.get();
    }

    public void setEnabled(boolean value) {
        enabled.set(value);
    }

    public SimulatorMode getMode() {
        return mode.get();
    }

    public void setMode(SimulatorMode value) {
        mode.set(value);
    }

    // Status snapshot for the API
    public SimulatorStatus getStatus() {
        return new SimulatorStatus(enabled.get(), mode.get());
    }

    public record SimulatorStatus(boolean enabled, SimulatorMode mode) {}
}
