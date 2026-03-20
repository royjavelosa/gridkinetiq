package com.bess.commandcenter.repository;

import com.bess.commandcenter.domain.TelemetryReading;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryRepository extends MongoRepository<TelemetryReading, String> {

    // Latest reading for a site
    Optional<TelemetryReading> findTopBySiteIdOrderByTimestampDesc(String siteId);

    // Latest reading for a device
    Optional<TelemetryReading> findTopByDeviceIdOrderByTimestampDesc(String deviceId);

    // Time-range query for charts (site level)
    List<TelemetryReading> findBySiteIdAndTimestampBetweenOrderByTimestampAsc(
        String siteId, Instant from, Instant to
    );

    // Most recent N readings for a site
    List<TelemetryReading> findTop100BySiteIdOrderByTimestampDesc(String siteId);

    // Cleanup old telemetry (keep DB lean in demo)
    void deleteBySiteIdAndTimestampBefore(String siteId, Instant cutoff);
}
