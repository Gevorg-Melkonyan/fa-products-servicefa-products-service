# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "import_service_rg" {
  location = "northeurope"
  name     = "rg-import-service-sand-ne-555"
}

resource "azurerm_storage_account" "imports_service_fa" {
  name     = "stgsangpimportsfane555"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_storage_share" "imports_service_fa" {
  name  = "fa-imports-service-share555"
  quota = 2

  storage_account_name = azurerm_storage_account.imports_service_fa.name
}

resource "azurerm_service_plan" "import_service_plan" {
  name     = "asp-import-service-sand-ne-555"
  location = "northeurope"

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_application_insights" "imports_service_fa" {
  name             = "appins-fa-imports-service-sand-ne-555"
  application_type = "web"
  location         = "northeurope"


  resource_group_name = azurerm_resource_group.import_service_rg.name
}


resource "azurerm_windows_function_app" "imports_service" {
  name     = "fa-imports-service-ne-555"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.import_service_plan.id
  resource_group_name = azurerm_resource_group.import_service_rg.name

  storage_account_name       = azurerm_storage_account.imports_service_fa.name
  storage_account_access_key = azurerm_storage_account.imports_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.imports_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.imports_service_fa.connection_string

    # For production systems set this to false, but consumption plan supports only 32bit workers
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.imports_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.imports_service_fa.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}




# create a Storage account with container and blob storage
resource "azurerm_storage_account" "sa" {
  name                             = "blobstorageaccount555"
  resource_group_name              = azurerm_resource_group.import_service_rg.name
  location                         = azurerm_resource_group.import_service_rg.location
  account_tier                     = "Standard"
  account_replication_type         = "LRS" /*  GRS, RAGRS, ZRS, GZRS, RAGZRS */
  access_tier                      = "Cool"
  enable_https_traffic_only        = true
  allow_nested_items_to_be_public  = true
  shared_access_key_enabled        = true
#   public_network_access_enabled    = true

  /* edge_zone = "North Europe" */
}

resource "azurerm_storage_container" "sa_container" {
  name                  = "uploaded"
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = "private"
}

resource "azurerm_storage_blob" "sa_blob" {
  name                   = "my-products-content.zip"
  storage_account_name   = azurerm_storage_account.sa.name
  storage_container_name = azurerm_storage_container.sa_container.name
  type                   = "Block"
  source                 = "products.csv"
  access_tier            = "Cool"
}

# # create SAS token
# data "azurerm_storage_account_sas" "sa" {
#   connection_string = azurerm_storage_account.sa.primary_connection_string
#   https_only        = true
#   signed_version    = "2023-07-29"
#
#   resource_types {
#     service   = true
#     container = true
#     object    = false
#   }
#
#   services {
#     blob  = true
#     queue = false
#     table = false
#     file  = false
#   }
#
#   start  = "2018-03-21T00:00:00Z"
#   expiry = "2030-12-21T00:00:00Z"
#
#   permissions {
#     read    = true
#     write   = true
#     delete  = false
#     list    = false
#     add     = true
#     create  = true
#     update  = false
#     process = false
#     tag     = false
#     filter  = false
#   }
# }
#
# output "sas_url_query_string" {
#   sensitive = false
#   value = data.azurerm_storage_account_sas.sa.sas
# }


# Create Service Bus Namespace
resource "azurerm_servicebus_namespace" "sb" {
  name                          = "my-new-servicebus-555"
  location                      = azurerm_resource_group.import_service_rg.location
  resource_group_name           = azurerm_resource_group.import_service_rg.name
  sku                           = "Basic"
  capacity                      = 0 /* standard for sku plan */
  # public_network_access_enabled = true /* can be changed to false for premium */
  # minimum_tls_version           = "1.2"
  zone_redundant                = false /* can be changed to true for premium */
}

# Create Service Bus Queue
resource "azurerm_servicebus_queue" "example" {
  name                                    = "my_new_servicebus_queue-555"
  namespace_id                            = azurerm_servicebus_namespace.sb.id
  status                                  = "Active" /* Default value */
  enable_partitioning                     = true /* Default value */
  lock_duration                           = "PT1M" /* ISO 8601 timespan duration, 5 min is max */
  # max_message_size_in_kilobytes           = 256 /* default for Basic tier */
  max_size_in_megabytes                   = 1024 /* Default value */
  max_delivery_count                      = 10 /* Default value */
  requires_duplicate_detection            = false
  duplicate_detection_history_time_window = "PT10M" /* ISO 8601 timespan duration, 5 min is max */
  requires_session                        = false
  dead_lettering_on_message_expiration    = false
}