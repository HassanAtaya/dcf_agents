package com.valsoft.library.dto;

import java.util.List;

public class AuthDtos {

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class LoginResponse {
        public Long id;
        public String username;
        public String firstname;
        public String lastname;
        public String language;
        public String basicToken;
        public List<String> roles;
        public List<String> permissions;
    }

    public static class ProfileUpdateRequest {
        public String firstname;
        public String lastname;
        public String password;
        public String language;
    }
}
