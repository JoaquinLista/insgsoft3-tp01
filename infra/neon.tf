# Proyecto Neon nuevo y separado — nunca el mismo que QA/prod. El provider
# crea el branch, la base y el rol por default junto con el proyecto; de ahí
# salen los datos de conexion que usa el backend (ver render.tf).
resource "neon_project" "preprod" {
  name   = "panaderias-preprod"
  org_id = var.neon_org_id

  # El default del provider (86400s = 24h) excede el maximo del plan free de
  # Neon (21600s = 6h) — hay que fijarlo a mano, no alcanza con el default.
  history_retention_seconds = 21600
}

# El proyecto nace con la base vacia (sin tablas). El init.sql del TP2 ya
# define schema + seed; se aplica una sola vez por apply con un script de
# Node (reusa el driver `pg` que ya esta instalado en backend/node_modules —
# nada de Docker acá, para no depender de que el daemon este corriendo).
resource "null_resource" "schema_preprod" {
  triggers = {
    project_id = neon_project.preprod.id
  }

  provisioner "local-exec" {
    # La connection string va por variable de entorno, no en el comando: si
    # el paso falla, el error de Terraform no la vuelve a imprimir en claro.
    environment = {
      DATABASE_URL = neon_project.preprod.connection_uri
      NODE_PATH    = "${replace(abspath(path.module), "\\", "/")}/../backend/node_modules"
    }
    command = "node ${replace(abspath(path.module), "\\", "/")}/scripts/apply-schema.js"
  }

  depends_on = [neon_project.preprod]
}
