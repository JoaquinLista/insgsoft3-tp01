output "preprod_api_url" {
  value = render_web_service.api_preprod.url
}

output "preprod_front_url" {
  value = render_web_service.front_preprod.url
}

output "preprod_database_host" {
  value     = neon_project.preprod.database_host
  sensitive = true
}
