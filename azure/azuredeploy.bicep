@description('Name prefix for all resources')
param projectName string = 'Applied-LLM-Platform'

@description('Location for all resources')
param location string = resourceGroup().location

@description('Container image to deploy (e.g., myregistry.azurecr.io/app:latest)')
param containerImage string

@description('Port the container listens on')
param containerPort int = 3000

@description('Container registry server (e.g., myregistry.azurecr.io). Leave empty for Docker Hub.')
param containerRegistry string = ''

@description('Container registry username. Leave empty for public registries.')
param containerRegistryUsername string = ''

@description('Container registry password. Leave empty for public registries.')
@secure()
param containerRegistryPassword string = ''

@description('PostgreSQL administrator username')
param postgresAdminUsername string = 'pgadmin'

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('PostgreSQL database name')
param postgresDatabaseName string = 'playground'

@description('OpenAI API Key')
@secure()
param openaiApiKey string

@description('LiveKit API Key (optional)')
@secure()
param livekitApiKey string = ''

@description('LiveKit API Secret (optional)')
@secure()
param livekitApiSecret string = ''

@description('LiveKit URL (optional)')
param livekitUrl string = ''

@description('Tavily API Key (optional)')
@secure()
param tavilyApiKey string = ''

@description('Serper API Key (optional)')
@secure()
param serperApiKey string = ''

@description('Minimum number of replicas')
@minValue(0)
@maxValue(25)
param minReplicas int = 1

@description('Maximum number of replicas')
@minValue(1)
@maxValue(25)
param maxReplicas int = 3

var environmentName = '${projectName}-env'
var containerAppName = '${projectName}-app'
var logAnalyticsName = '${projectName}-logs'
var postgresServerName = '${projectName}-postgres'
var databaseUrl = 'postgresql://${postgresAdminUsername}:${postgresAdminPassword}@${postgresServerName}.postgres.database.azure.com:5432/${postgresDatabaseName}?sslmode=require'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    administratorLogin: postgresAdminUsername
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource postgresServerName_postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: '${postgresDatabaseName}'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

resource postgresServerName_AllowAllAzureServicesAndResourcesWithinAzureIps 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  parent: postgresServer
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource environment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalytics.id, '2022-10-01').customerId
        sharedKey: listKeys(logAnalytics.id, '2022-10-01').primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerPort
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: (empty(containerRegistry)
        ? json('[]')
        : json('[{"server": "${containerRegistry}", "username": "${containerRegistryUsername}", "passwordSecretRef": "registry-password"}]'))
      secrets: concat(
        (empty(containerRegistry)
          ? json('[]')
          : json('[{"name": "registry-password", "value": "${containerRegistryPassword}"}]')),
        json('[{"name": "database-url", "value": "${databaseUrl}"}, {"name": "openai-api-key", "value": "${openaiApiKey}"}, {"name": "livekit-api-key", "value": "${livekitApiKey}"}, {"name": "livekit-api-secret", "value": "${livekitApiSecret}"}, {"name": "tavily-api-key", "value": "${tavilyApiKey}"}, {"name": "serper-api-key", "value": "${serperApiKey}"}]')
      )
      activeRevisionsMode: 'Single'
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'OPENAI_API_KEY'
              secretRef: 'openai-api-key'
            }
            {
              name: 'LIVEKIT_API_KEY'
              secretRef: 'livekit-api-key'
            }
            {
              name: 'LIVEKIT_API_SECRET'
              secretRef: 'livekit-api-secret'
            }
            {
              name: 'LIVEKIT_URL'
              value: livekitUrl
            }
            {
              name: 'TAVILY_API_KEY'
              secretRef: 'tavily-api-key'
            }
            {
              name: 'SERPER_API_KEY'
              secretRef: 'serper-api-key'
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'NEXT_PUBLIC_API_URL'
              value: 'https://${containerAppName}.${reference(environment.id,'2023-05-01').defaultDomain}'
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    postgresServerName_postgresDatabase
    postgresServerName_AllowAllAzureServicesAndResourcesWithinAzureIps
  ]
}

output containerAppFQDN string = reference(containerApp.id, '2023-05-01').configuration.ingress.fqdn
output containerAppUrl string = 'https://${reference(containerApp.id,'2023-05-01').configuration.ingress.fqdn}'
output postgresServerName string = postgresServerName
output postgresFQDN string = reference(postgresServer.id, '2022-12-01').fullyQualifiedDomainName
output databaseName string = postgresDatabaseName
