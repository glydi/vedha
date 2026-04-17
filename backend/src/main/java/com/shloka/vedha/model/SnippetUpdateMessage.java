package com.shloka.vedha.model;

public class SnippetUpdateMessage {
    private Long id;
    private String code;
    private String sender;

    public SnippetUpdateMessage() {
    }

    public SnippetUpdateMessage(Long id, String code, String sender) {
        this.id = id;
        this.code = code;
        this.sender = sender;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }
}
