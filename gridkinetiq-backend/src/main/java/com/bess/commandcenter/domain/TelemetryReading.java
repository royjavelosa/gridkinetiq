package com.bess.commandcenter.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "telemetry")
@CompoundIndexes({
    @CompoundIndex(name = "site_time_idx", def = "{'siteId': 1, 'timestamp': -1}"),
    @CompoundIndex(name = "device_time_idx", def = "{'deviceId': 1, 'timestamp': -1}")
})
public class TelemetryReading {

    @Id
    private String id;

    @Indexed
    private String siteId;

    @Indexed
    private String deviceId;

    private double socPercent;
    private double powerKw;       // positive = charging, negative = discharging
    private double voltageV;
    private double currentA;
    private double tempCelsius;
    private double frequencyHz;

    private String dispatchState; // CHARGING, DISCHARGING, STANDBY
    private boolean alarmActive;
    private String alarmCode;

    @Indexed
    private Instant timestamp;
}
