package com.bess.commandcenter.controller;

import com.bess.commandcenter.domain.Device;
import com.bess.commandcenter.domain.Site;
import com.bess.commandcenter.domain.TelemetryReading;
import com.bess.commandcenter.service.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    public List<Site> getAllSites() {
        return siteService.getAllSites();
    }

    @GetMapping("/fleet-summary")
    public SiteService.FleetSummary getFleetSummary() {
        return siteService.getFleetSummary();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Site> getSite(@PathVariable String id) {
        return siteService.getSiteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/devices")
    public ResponseEntity<List<Device>> getDevices(@PathVariable String id) {
        return siteService.getSiteById(id)
                .map(site -> ResponseEntity.ok(siteService.getDevicesForSite(id)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/telemetry")
    public ResponseEntity<List<TelemetryReading>> getTelemetry(
            @PathVariable String id,
            @RequestParam(defaultValue = "recent") String range) {

        return siteService.getSiteById(id).map(site -> {
            List<TelemetryReading> readings = range.equals("24h")
                    ? siteService.getLast24Hours(id)
                    : siteService.getRecentTelemetry(id);
            return ResponseEntity.ok(readings);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/telemetry/range")
    public ResponseEntity<List<TelemetryReading>> getTelemetryRange(
            @PathVariable String id,
            @RequestParam Instant from,
            @RequestParam Instant to) {

        return siteService.getSiteById(id)
                .map(site -> ResponseEntity.ok(siteService.getTelemetryRange(id, from, to)))
                .orElse(ResponseEntity.notFound().build());
    }
}
