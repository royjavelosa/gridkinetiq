package com.bess.commandcenter.simulator;

import com.bess.commandcenter.domain.Device;
import com.bess.commandcenter.domain.Site;
import com.bess.commandcenter.domain.TelemetryReading;
import com.bess.commandcenter.repository.DeviceRepository;
import com.bess.commandcenter.repository.SiteRepository;
import com.bess.commandcenter.repository.TelemetryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemetrySimulator {

    private final SiteRepository siteRepository;
    private final DeviceRepository deviceRepository;
    private final TelemetryRepository telemetryRepository;
    private final SimulatorConfig simulatorConfig;

    private final Random random = new Random();

    // Runs every 3 seconds - checks if enabled before doing anything
    @Scheduled(fixedDelayString = "${simulator.interval-ms:3000}")
    public void tick() {
        if (!simulatorConfig.isEnabled()) {
            return;
        }

        List<Site> sites = siteRepository.findAll();
        if (sites.isEmpty()) {
            log.debug("No sites found, skipping simulator tick");
            return;
        }

        SimulatorConfig.SimulatorMode mode = simulatorConfig.getMode();

        for (Site site : sites) {
            if (site.getStatus() == Site.SiteStatus.OFFLINE) continue;

            // Generate new telemetry reading
            TelemetryReading reading = generateReading(site, mode);
            telemetryRepository.save(reading);

            // Update site aggregate values
            site.setSocPercent(reading.getSocPercent());
            site.setPowerKw(reading.getPowerKw());
            site.setVoltageV(reading.getVoltageV());
            site.setTempCelsius(reading.getTempCelsius());
            site.setUpdatedAt(Instant.now());

            // In LIVE mode, occasionally trigger alarms
            if (mode == SimulatorConfig.SimulatorMode.LIVE) {
                site.setActiveAlarms(reading.isAlarmActive() ? site.getActiveAlarms() + 1 : Math.max(0, site.getActiveAlarms() - 1));
            }

            siteRepository.save(site);

            // Also update devices for this site
            tickDevices(site, mode);
        }

        // Prune old telemetry - keep last 24 hours only (keeps Atlas free tier happy)
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        for (Site site : sites) {
            telemetryRepository.deleteBySiteIdAndTimestampBefore(site.getId(), cutoff);
        }

        log.debug("Simulator tick complete - mode={} sites={}", mode, sites.size());
    }

    private TelemetryReading generateReading(Site site, SimulatorConfig.SimulatorMode mode) {
        double currentSoc = site.getSocPercent();
        double currentPower = site.getPowerKw();

        double newSoc;
        double newPower;
        boolean alarmActive = false;
        String alarmCode = null;

        if (mode == SimulatorConfig.SimulatorMode.STEADY) {
            // Drift very slightly around baseline
            newSoc = clamp(currentSoc + (random.nextDouble() - 0.5) * 0.5, 20, 95);
            newPower = clamp(currentPower + (random.nextDouble() - 0.5) * 10, -site.getCapacityKwh() * 0.1, site.getCapacityKwh() * 0.1);
        } else {
            // LIVE mode - more dynamic behavior based on dispatch state
            newSoc = simulateLiveSoc(site, currentSoc);
            newPower = simulateLivePower(site);

            // 3% chance of alarm in LIVE mode
            if (random.nextDouble() < 0.03) {
                alarmActive = true;
                alarmCode = randomAlarmCode();
            }
        }

        double voltage = 800 + (random.nextDouble() - 0.5) * 20;
        double current = newPower * 1000 / voltage;
        double temp = 28 + (random.nextDouble() - 0.5) * 4;

        return TelemetryReading.builder()
                .id(UUID.randomUUID().toString())
                .siteId(site.getId())
                .socPercent(round(newSoc))
                .powerKw(round(newPower))
                .voltageV(round(voltage))
                .currentA(round(current))
                .tempCelsius(round(temp))
                .frequencyHz(60.0 + (random.nextDouble() - 0.5) * 0.1)
                .dispatchState(site.getDispatchState() != null ? site.getDispatchState().name() : "STANDBY")
                .alarmActive(alarmActive)
                .alarmCode(alarmCode)
                .timestamp(Instant.now())
                .build();
    }

    private double simulateLiveSoc(Site site, double currentSoc) {
        Site.DispatchState state = site.getDispatchState();
        if (state == null) return currentSoc;

        return switch (state) {
            case CHARGING -> clamp(currentSoc + random.nextDouble() * 0.8, 20, 98);
            case DISCHARGING -> clamp(currentSoc - random.nextDouble() * 0.8, 5, 95);
            case STANDBY -> clamp(currentSoc + (random.nextDouble() - 0.5) * 0.2, 20, 95);
            case FAULT -> currentSoc; // frozen during fault
        };
    }

    private double simulateLivePower(Site site) {
        double cap = site.getCapacityKwh();
        Site.DispatchState state = site.getDispatchState();
        if (state == null) return 0;

        return switch (state) {
            case CHARGING -> clamp(cap * 0.3 + random.nextDouble() * cap * 0.2, 0, cap * 0.5);
            case DISCHARGING -> clamp(-(cap * 0.4 + random.nextDouble() * cap * 0.3), -cap * 0.7, 0);
            case STANDBY -> (random.nextDouble() - 0.5) * cap * 0.02;
            case FAULT -> 0;
        };
    }

    private void tickDevices(Site site, SimulatorConfig.SimulatorMode mode) {
        List<Device> devices = deviceRepository.findBySiteId(site.getId());
        for (Device device : devices) {
            if (device.getStatus() == Device.DeviceStatus.OFFLINE) continue;

            if (device.getType() == Device.DeviceType.BATTERY_MODULE) {
                double socDelta = (random.nextDouble() - 0.5) * (mode == SimulatorConfig.SimulatorMode.LIVE ? 2.0 : 0.3);
                device.setSocPercent(clamp(device.getSocPercent() + socDelta, 10, 98));
                device.setTempCelsius(round(site.getTempCelsius() + (random.nextDouble() - 0.5) * 2));
            } else if (device.getType() == Device.DeviceType.INVERTER) {
                device.setTempCelsius(round(site.getTempCelsius() + (random.nextDouble() - 0.5) * 2));
            }
            device.setPowerKw(round(site.getPowerKw() / Math.max(devices.size(), 1) + (random.nextDouble() - 0.5) * 5));
            device.setVoltageV(round(site.getVoltageV() + (random.nextDouble() - 0.5) * 5));
            device.setLastSeenAt(Instant.now());
            deviceRepository.save(device);
        }
    }

    private String randomAlarmCode() {
        String[] codes = {"OVER_TEMP", "UNDER_VOLTAGE", "COMM_LOSS", "SOC_LOW", "CELL_IMBALANCE"};
        return codes[random.nextInt(codes.length)];
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
