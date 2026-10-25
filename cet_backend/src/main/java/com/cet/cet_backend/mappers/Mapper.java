package com.cet.cet_backend.mappers;

/**
 * Generic interface for mapping between Entity and Data Transfer Object (DTO) models.
 *
 * @param <A> The source type (typically Entity).
 * @param <B> The target type (typically DTO).
 */
public interface Mapper<A, B> {

    /**
     * Maps an Entity object to a DTO object.
     */
    B mapTo(A a);

    /**
     * Maps a DTO object back to an Entity object.
     */
    A mapFrom(B b);
}