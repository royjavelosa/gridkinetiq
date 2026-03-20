package com.bess.commandcenter.service;

import com.bess.commandcenter.domain.Device;
import com.bess.commandcenter.domain.Site;
import com.bess.commandcenter.domain.TelemetryReading;
import com.bess.commandcenter.repository.DeviceRepository;
import com.bess.commandcenter.repository.SiteRepository;
import com.bess.commandcenter.repository.TelemetryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final DeviceRepository deviceRepository;
    private final TelemetryRepository telemetryRepository;

    public List<Site> getAllSites() {
        return siteRepository.findAll();
    }

    public Optional<Site> getSiteById(String id) {
        return siteRepository.findById(id);
    }

    public List<Device> getDevicesForSite(String siteId) {
        return deviceRepository.findBySiteId(siteId);
    }

    public List<TelemetryReading> getRecentTelemetry(String siteId) {
        return telemetryRepository.findTop100BySiteIdOrderByTimestampDesc(siteId);
    }

    public List<TelemetryReading> getTelemetryRange(String siteId, Instant from, Instant to) {
        return telemetryRepository.findBySiteIdAndTimestampBetweenOrderByTimestampAsc(siteId, from, to);
    }

    public List<TelemetryReading> getLast24Hours(String siteId) {
        Instant from = Instant.now().minus(24, ChronoUnit.HOURS);
        return telemetryRepository.findBySiteIdAndTimestampBetweenOrderByTimestampAsc(siteId, from, Instant.now());
    }

    // Fleet summary stats
    public FleetSummary getFleetSummary() {
        List<Site> sites = siteRepository.findAll();
        long online = sites.stream().filter(s -> s.getStatus() == Site.SiteStatus.ONLINE).count();
        double totalCapacity = sites.stream().mapToDouble(Site::getCapacityKwh).sum();
        double avgSoc = sites.stream().mapToDouble(Site::getSocPercent).average().orElse(0);
        double totalPower = sites.stream().mapToDouble(Site::getPowerKw).sum();
        int totalAlarms = sites.stream().mapToInt(Site::getActiveAlarms).sum();

        return new FleetSummary(sites.size(), (int) online, totalCapacity, avgSoc, totalPower, totalAlarms);
    }

    public record FleetSummary(
        int totalSites,
        int onlineSites,
        double totalCapacityKwh,
        double avgSocPercent,
        double totalPowerKw,
        int totalAlarms
    ) {}
}
