variable "image_tag" {
  description = "Tag de las imagenes del TP7 a desplegar en preprod (ghcr.io/joaquinlista/insgsoft3-tp01-{backend,frontend}:<tag>)"
  type        = string
  default     = "sha-d1aa49f06d5ff97522a78ac853677cb0b26f8b7b"
}

variable "render_region" {
  description = "Misma region que QA/prod"
  type        = string
  default     = "oregon"
}

variable "render_plan" {
  description = "Mismo plan que QA/prod"
  type        = string
  default     = "free"
}

variable "neon_org_id" {
  description = "ID de la organizacion de Neon (dashboard -> Organization settings) — la API de Neon lo exige para crear un proyecto, aunque el provider lo marque optional"
  type        = string
}

variable "dns_resolver" {
  description = "DNS publico para el resolver de nginx en el front (mismo valor que QA/prod)"
  type        = string
  default     = "8.8.8.8"
}
