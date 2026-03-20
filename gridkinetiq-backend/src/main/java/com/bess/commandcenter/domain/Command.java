package com.bess.commandcenter.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "commands")
public class Command {

    @Id
    private String id;

    @Indexed
    private String siteId;

    private String deviceId; // null = site-level command

    private CommandType type;
    private CommandStatus status;

    // Flexible params: e.g. { "powerKw": 500, "durationMinutes": 60 }
    private Map<String, Object> params;

    private String issuedBy;
    private String notes;

    private Instant issuedAt;
    private Instant acknowledgedAt;
    private Instant completedAt;

    public enum CommandType {
        CHARGE,
        DISCHARGE,
        STANDBY,
        EMERGENCY_STOP,
        SET_POWER_LIMIT,
        RESET_ALARMS
    }

    public enum CommandStatus {
        PENDING,
        ACKNOWLEDGED,
        EXECUTING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
