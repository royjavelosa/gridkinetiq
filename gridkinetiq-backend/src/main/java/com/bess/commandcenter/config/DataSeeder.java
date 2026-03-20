package com.bess.commandcenter.config;

import com.bess.commandcenter.domain.Device;
import com.bess.commandcenter.domain.Site;
import com.bess.commandcenter.repository.DeviceRepository;
import com.bess.commandcenter.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SiteRepository siteRepository;
    private final DeviceRepository deviceRepository;

    @Override
    public void run(String... args) {
        if (siteRepository.count() > 0) {
            log.info("Data already seeded, skipping");
            return;
        }

        log.info("Seeding initial GridKinetiq site and device data...");
        seedSites();
        log.info("Seeding complete");
    }

    private void seedSites() {
        List<SiteSeed> seeds = List.of(
            new SiteSeed("Chula Vista Energy Center", "Chula Vista, CA", "America/Los_Angeles", 32.6401, -117.0842, 4000, Site.DispatchState.DISCHARGING, 72.4),
            new SiteSeed("Bethlehem Grid Support", "Bethlehem, PA", "America/New_York", 40.6259, -75.3705, 2000, Site.DispatchState.CHARGING, 45.1),
            new SiteSeed("Austin Frequency Reg", "Austin, TX", "America/Chicago", 30.2672, -97.7431, 6000, Site.DispatchState.STANDBY, 88.3),
            new SiteSeed("Waratah Super Battery", "New South Wales, AU", "Australia/Sydney", -32.7682, 151.5700, 17000, Site.DispatchState.DISCHARGING, 61.7),
            new SiteSeed("Phoenix Solar+Storage", "Phoenix, AZ", "America/Phoenix", 33.4484, -112.0740, 8000, Site.DispatchState.CHARGING, 33.2),
            new SiteSeed("Denver Microgrid Hub", "Denver, CO", "America/Denver", 39.7392, -104.9903, 3000, Site.DispatchState.STANDBY, 79.9)
        );

        for (SiteSeed seed : seeds) {
            String siteId = UUID.randomUUID().toString();

            List<String> deviceIds = new ArrayList<>();
            List<Device> devices = createDevices(siteId, seed);
            deviceRepository.saveAll(devices);
            devices.forEach(d -> deviceIds.add(d.getId()));

            Site site = Site.builder()
                    .id(siteId)
                    .name(seed.name())
                    .location(seed.location())
                    .timezone(seed.timezone())
                    .latitude(seed.lat())
                    .longitude(seed.lon())
                    .status(Site.SiteStatus.ONLINE)
                    .dispatchState(seed.dispatchState())
                    .capacityKwh(seed.capacityKwh())
                    .socPercent(seed.initialSoc())
                    .powerKw(seed.dispatchState() == Site.DispatchState.CHARGING ? seed.capacityKwh() * 0.15 : -seed.capacityKwh() * 0.2)
                    .voltageV(800)
                    .tempCelsius(28.5)
                    .activeAlarms(0)
                    .deviceIds(deviceIds)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            siteRepository.save(site);
            log.info("Seeded site: {} with {} devices", seed.name(), devices.size());
        }
    }

    private List<Device> createDevices(String siteId, SiteSeed seed) {
        List<Device> devices = new ArrayList<>();

        // Battery modules - one per 1000 kWh capacity
        int batteryCount = (int) (seed.capacityKwh() / 1000);
        for (int i = 1; i <= batteryCount; i++) {
            devices.add(Device.builder()
                    .id(UUID.randomUUID().toString())
                    .siteId(siteId)
                    .name("Battery Module " + String.format("%02d", i))
                    .type(Device.DeviceType.BATTERY_MODULE)
                    .status(Device.DeviceStatus.ONLINE)
                    .manufacturer("CATL")
                    .model("EnerC 1000")
                    .serialNumber("CATL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .firmwareVersion("2.4.1")
                    .protocol("MODBUS")
                    .capacityKwh(1000)
                    .maxPowerKw(500)
                    .socPercent(seed.initialSoc() + (Math.random() - 0.5) * 5)
                    .powerKw(150 + Math.random() * 50)
                    .voltageV(800 + Math.random() * 10)
                    .tempCelsius(27 + Math.random() * 3)
                    .lastSeenAt(Instant.now())
                    .createdAt(Instant.now())
                    .build());
        }

        // Inverters - one per 2 battery modules
        int inverterCount = Math.max(1, batteryCount / 2);
        for (int i = 1; i <= inverterCount; i++) {
            devices.add(Device.builder()
                    .id(UUID.randomUUID().toString())
                    .siteId(siteId)
                    .name("Inverter " + String.format("%02d", i))
                    .type(Device.DeviceType.INVERTER)
                    .status(Device.DeviceStatus.ONLINE)
                    .manufacturer("SMA")
                    .model("Sunny Central 2200")
                    .serialNumber("SMA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .firmwareVersion("3.1.0")
                    .protocol("MODBUS")
                    .capacityKwh(0)
                    .maxPowerKw(2200)
                    .socPercent(0)
                    .powerKw(1800 + Math.random() * 200)
                    .voltageV(690 + Math.random() * 10)
                    .tempCelsius(35 + Math.random() * 5)
                    .lastSeenAt(Instant.now())
                    .createdAt(Instant.now())
                    .build());
        }

        // Meter
        devices.add(Device.builder()
                .id(UUID.randomUUID().toString())
                .siteId(siteId)
                .name("Revenue Grade Meter")
                .type(Device.DeviceType.METER)
                .status(Device.DeviceStatus.ONLINE)
                .manufacturer("Schweitzer")
                .model("SEL-735")
                .serialNumber("SEL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .firmwareVersion("1.2.0")
                .protocol("MODBUS")
                .capacityKwh(0)
                .maxPowerKw(0)
                .socPercent(0)
                .powerKw(0)
                .voltageV(13800)
                .tempCelsius(0)
                .lastSeenAt(Instant.now())
                .createdAt(Instant.now())
                .build());

        return devices;
    }

    private record SiteSeed(
        String name, String location, String timezone,
        double lat, double lon,
        double capacityKwh, Site.DispatchState dispatchState, double initialSoc
    ) {}
}
