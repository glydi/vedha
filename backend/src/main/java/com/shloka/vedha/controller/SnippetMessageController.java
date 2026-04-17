package com.shloka.vedha.controller;

import com.shloka.vedha.model.SnippetUpdateMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SnippetMessageController {

    @MessageMapping("/edit")
    @SendTo("/topic/updates")
    public SnippetUpdateMessage broadcastUpdate(SnippetUpdateMessage message) {
        return message;
    }
}
