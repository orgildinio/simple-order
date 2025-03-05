import type {
	authenticationMessages,
	basicMessages,
	illegalCharactersMessages,
	invalidFieldsMessages,
	missingFieldMessages,
	relationshipMessages,
	serviceConstraintMessages,
	tokenMessages,
} from '@/library/constants'

export type BasicMessages = (typeof basicMessages)[keyof typeof basicMessages]
export type AuthenticationMessages = (typeof authenticationMessages)[keyof typeof authenticationMessages]
export type IllegalCharactersMessages = (typeof illegalCharactersMessages)[keyof typeof illegalCharactersMessages]
export type RelationshipMessages = (typeof relationshipMessages)[keyof typeof relationshipMessages]
export type MissingFieldMessages = (typeof missingFieldMessages)[keyof typeof missingFieldMessages]
export type TokenMessages = (typeof tokenMessages)[keyof typeof tokenMessages]
export type InvalidFieldMessages = (typeof invalidFieldsMessages)[keyof typeof invalidFieldsMessages]
export type ServiceConstraintMessages = (typeof serviceConstraintMessages)[keyof typeof serviceConstraintMessages]

export type EmailTokenMessages = TokenMessages | 'token used'
