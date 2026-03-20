package com.bess.commandcenter.controller;

import com.bess.commandcenter.domain.Command;
import com.bess.commandcenter.service.CommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commands")
@RequiredArgsConstructor
public class CommandController {

    private final CommandService commandService;

    // Dispatch a command to a site
    @PostMapping("/dispatch")
    public ResponseEntity<Command> dispatch(@RequestBody DispatchRequest request) {
        try {
            Command command = commandService.dispatch(
                    request.siteId(),
                    request.type(),
                    request.params(),
                    request.issuedBy()
            );
            return ResponseEntity.ok(command);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get recent commands across all sites
    @GetMapping("/recent")
    public List<Command> getRecentCommands() {
        return commandService.getRecentCommands();
    }

    // Get command history for a specific site
    @GetMapping("/site/{siteId}")
    public List<Command> getCommandHistory(@PathVariable String siteId) {
        return commandService.getCommandHistory(siteId);
    }

    // Get a single command by ID
    @GetMapping("/{id}")
    public ResponseEntity<Command> getCommand(@PathVariable String id) {
        return commandService.getCommand(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public record DispatchRequest(
        String siteId,
        Command.CommandType type,
        Map<String, Object> params,
        String issuedBy
    ) {}
}
