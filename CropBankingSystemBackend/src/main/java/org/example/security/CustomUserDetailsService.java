package org.example.security;

import jakarta.validation.constraints.NotNull;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// @desc UserDetailsService is the bridge between Spring Security and your database.
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(@NotNull String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid user credentials email"));

        // if (!Boolean.TRUE.equals(user.getActive())) {
        // throw new NotActiveException("User is deactivated: " + email);
        // }

        // @desc UserDetails is a security representation of your user, not your entity.
        // UserDetails userDetails = builder().username(user.getEmail()) //using email
        // as usernam
        // .password(user.getPassword())
        // .roles(user.getRole().name())
        // .build();

        return new CustomUserDetails(user);
    }
}
