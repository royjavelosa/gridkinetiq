package com.bess.commandcenter.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "devices")
public class Device {

    @Id
    private String id;

    private String siteId;
    private String name;
    private DeviceType type;
    private DeviceStatus status;

    private String manufacturer;
    private String model;
    private String serialNumber;
    private String firmwareVersion;

    // Protocol this device speaks
    private String protocol; // MODBUS, CANBUS, RS485, OCPP

    // Nameplate specs
    private double capacityKwh;
    private double maxPowerKw;

    // Latest reading (denormalized)
    private double socPercent;
    private double powerKw;
    private double voltageV;
    private double tempCelsius;

    private Instant lastSeenAt;
    private Instant createdAt;

    public enum DeviceType {
        BATTERY_MODULE, INVERTER, EV_CHARGER, THERMOSTAT, SOLAR_PANEL, METER
    }

    public enum DeviceStatus {
        ONLINE, OFFLINE, FAULT, MAINTENANCE
    }
}
