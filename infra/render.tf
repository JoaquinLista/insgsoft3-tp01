locals {
  backend_image  = "ghcr.io/joaquinlista/insgsoft3-tp01-backend"
  frontend_image = "ghcr.io/joaquinlista/insgsoft3-tp01-frontend"
}

# Misma imagen del TP7 (ghcr.io, sha-<commit>) — nunca se reconstruye nada acá.
resource "render_web_service" "api_preprod" {
  name   = "panaderias-api-preprod"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    image = {
      image_url = local.backend_image
      tag       = var.image_tag
    }
  }

  health_check_path = "/api/health"

  # La base la crea Neon (neon.tf); nada de esto se escribe a mano por entorno.
  env_vars = {
    POSTGRES_HOST     = { value = neon_project.preprod.database_host }
    POSTGRES_PORT     = { value = "5432" }
    POSTGRES_DB       = { value = neon_project.preprod.database_name }
    POSTGRES_USER     = { value = neon_project.preprod.database_user }
    POSTGRES_PASSWORD = { value = neon_project.preprod.database_password }
    POSTGRES_SSL      = { value = "true" }
  }

  depends_on = [null_resource.schema_preprod]
}

resource "render_web_service" "front_preprod" {
  name   = "panaderias-front-preprod"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    image = {
      image_url = local.frontend_image
      tag       = var.image_tag
    }
  }

  # BACKEND_URL sale del servicio que Render recién creó, no de una URL
  # pegada a mano (TP7 §1 — por que esto importa).
  env_vars = {
    BACKEND_URL  = { value = render_web_service.api_preprod.url }
    DNS_RESOLVER = { value = var.dns_resolver }
  }
}
