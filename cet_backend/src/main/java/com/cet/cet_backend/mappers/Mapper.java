package com.cet.cet_backend.mappers;

import org.springframework.stereotype.Component;

public interface Mapper<A, B> {
    B mapTo(A a);
    A mapFrom(B b);
}