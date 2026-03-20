package com.bess.commandcenter.service;

import com.bess.commandcenter.domain.Command;
import com.bess.commandcenter.domain.Site;
import com.bess.commandcenter.repository.CommandRepository;
import com.bess.commandcenter.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommandService {

    private final CommandRepository commandRepository;
    private final SiteRepository siteRepository;

    public Command dispatch(String siteId, Command.CommandType type, Map<String, Object> params, String issuedBy) {
        // Validate site exists
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));

        Command command = Command.builder()
                .id(UUID.randomUUID().toString())
                .siteId(siteId)
                .type(type)
                .status(Command.CommandStatus.PENDING)
                .params(params)
                .issuedBy(issuedBy != null ? issuedBy : "operator")
                .issuedAt(Instant.now())
                .build();

        commandRepository.save(command);
        log.info("Command dispatched: {} -> site={}", type, siteId);

        // Simulate acknowledgement and execution (in real system this goes to Kafka then gateway)
        applyCommandToSite(site, command);

        return command;
    }

    private void applyCommandToSite(Site site, Command command) {
        // Simulate the command being applied to site state
        Site.DispatchState newState = switch (command.getType()) {
            case CHARGE -> Site.DispatchState.CHARGING;
            case DISCHARGE -> Site.DispatchState.DISCHARGING;
            case STANDBY -> Site.DispatchState.STANDBY;
            case EMERGENCY_STOP -> Site.DispatchState.FAULT;
            case RESET_ALARMS -> {
                site.setActiveAlarms(0);
                yield site.getDispatchState();
            }
            default -> site.getDispatchState();
        };

        site.setDispatchState(newState);
        site.setUpdatedAt(Instant.now());
        siteRepository.save(site);

        // Mark command as completed (simulated - no real gateway)
        command.setStatus(Command.CommandStatus.COMPLETED);
        command.setAcknowledgedAt(Instant.now());
        command.setCompletedAt(Instant.now());
        commandRepository.save(command);

        log.info("Site {} dispatch state updated to {}", site.getName(), newState);
    }

    public List<Command> getCommandHistory(String siteId) {
        return commandRepository.findBySiteIdOrderByIssuedAtDesc(siteId);
    }

    public List<Command> getRecentCommands() {
        return commandRepository.findTop20ByOrderByIssuedAtDesc();
    }

    public Optional<Command> getCommand(String id) {
        return commandRepository.findById(id);
    }
}
