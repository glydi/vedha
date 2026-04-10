package com.shloka.vedha.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Enumeration;

@RestController
@RequestMapping("/api")
public class RequestController {

    @RequestMapping(value = "/**", method = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
            RequestMethod.DELETE })
    public String handleRequest(HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> payload) {
        System.out.println("\n--- Incoming Request Logged ---");
        System.out.println("Method      : " + request.getMethod());
        System.out.println("URI         : " + request.getRequestURI());
        System.out.println("Remote Addr : " + request.getRemoteAddr());

        System.out.println("Headers:");
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            System.out.println("  " + headerName + ": " + request.getHeader(headerName));
        }

        if (payload != null && !payload.isEmpty()) {
            System.out.println("Payload     : " + payload);
        } else {
            System.out.println("Payload     : [Empty or Not JSON]");
        }
        System.out.println("--------------------------------\n");

        return "Request successfully received and printed to console.";
    }
}
