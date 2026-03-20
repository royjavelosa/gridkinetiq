package com.bess.commandcenter.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sites")
public class Site {

    @Id
    private String id;

    private String name;
    private String location;
    private String timezone;
    private double latitude;
    private double longitude;

    private SiteStatus status;
    private DispatchState dispatchState;

    // Nameplate capacity in kWh
    private double capacityKwh;

    // Current aggregate telemetry (denormalized for fast reads)
    private double socPercent;
    private double powerKw;
    private double voltageV;
    private double tempCelsius;
    private int activeAlarms;

    private List<String> deviceIds;

    private Instant createdAt;
    private Instant updatedAt;

    public enum SiteStatus {
        ONLINE, OFFLINE, DEGRADED, MAINTENANCE
    }

    public enum DispatchState {
        CHARGING, DISCHARGING, STANDBY, FAULT
    }
}
