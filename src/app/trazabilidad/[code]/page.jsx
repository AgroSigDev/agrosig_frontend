'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API_URL = 'https://api-agrosig-backend.onrender.com'

export default function HistorialPage() {
  const params = useParams()
  const uniqueCode = params.code
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('resumen')

  useEffect(() => {
    const loadHistorial = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${API_URL}/production/traceability/${uniqueCode}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar el historial`)
        }

        const result = await response.json()
        setData(result.data)
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (uniqueCode) {
      loadHistorial()
    }
  }, [uniqueCode])

  if (loading) {
    return <LoadingState uniqueCode={uniqueCode} />
  }

  if (error) {
    return <ErrorState error={error} uniqueCode={uniqueCode} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FarmIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    {data.batch_info.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Historial de Producción - Agrosig
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex flex-col sm:items-end">
              <div className="bg-green-50 rounded-lg px-3 py-2 sm:px-4 sm:py-3 border border-green-200">
                <p className="text-xs sm:text-sm font-medium text-green-800">
                  Código: <span className="font-mono">{data.batch_info.unique_code}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Consulta: {new Date(data.summary.qr_scanned_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div className={`border-b ${data.summary.has_activities
        ? 'bg-green-50 border-green-200'
        : 'bg-amber-50 border-amber-200'
        }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
            <div className="flex items-center">
              {data.summary.has_activities ? (
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3" />
              ) : (
                <WarningIcon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-2 sm:mr-3" />
              )}
              <div>
                <h3 className={`text-sm sm:text-base font-semibold ${data.summary.has_activities ? 'text-green-800' : 'text-amber-800'
                  }`}>
                  {data.summary.has_activities ? 'Historial Completo' : 'Historial Básico'}
                </h3>
                <p className={`text-xs sm:text-sm ${data.summary.has_activities ? 'text-green-600' : 'text-amber-600'
                  }`}>
                  {data.message}
                </p>
              </div>
            </div>
            <div className="text-left xs:text-right">
              <p className="text-xs sm:text-sm text-gray-500">Estado del lote</p>
              <p className={`text-xs sm:text-sm font-medium ${data.summary.has_activities ? 'text-green-700' : 'text-amber-700'
                }`}>
                {data.summary.has_activities ? 'Activo' : 'Pendiente'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex space-x-4 sm:space-x-8 min-w-max">
            {[
              { id: 'resumen', name: 'Resumen', icon: ChartBarIcon },
              { id: 'actividades', name: 'Actividades', icon: ClipboardListIcon },
              { id: 'detalles', name: 'Detalles', icon: DocumentTextIcon },
              { id: 'metricas', name: 'Métricas', icon: ChartPieIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Tab Content */}
        {activeTab === 'resumen' && <SummaryTab data={data} setActiveTab={setActiveTab} />}
        {activeTab === 'actividades' && <ActivitiesTab data={data} />}
        {activeTab === 'detalles' && <DetailsTab data={data} />}
        {activeTab === 'metricas' && <MetricsTab data={data} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="text-center text-gray-500 text-xs sm:text-sm">
            <p>Sistema Agrosig • Historial de Producción Verificado</p>
            <p className="mt-1">Consulta generada el {new Date().toLocaleDateString('es-MX')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Componente de pestaña de Resumen
function SummaryTab({ data, setActiveTab }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <MetricCard
          title="Total Actividades"
          value={data.summary.total_activities}
          change={null}
          icon={<ClipboardListIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
          color="blue"
        />
        <MetricCard
          title="Inversión Total"
          value={`$${parseFloat(data.summary.total_batch_cost).toFixed(2)}`}
          change={null}
          icon={<CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
          color="green"
        />
        <MetricCard
          title="Duración del Cultivo"
          value={calculateCropDuration(data.crop_info.planting_date, data.crop_info.harvest_date)}
          change={null}
          icon={<CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
          color="purple"
        />
        <MetricCard
          title="Estado"
          value={data.summary.has_activities ? 'Completo' : 'Básico'}
          change={null}
          icon={<CheckBadgeIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />}
          color={data.summary.has_activities ? "green" : "amber"}
        />
      </div>

      {/* Grid de información principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <InfoCard
          title="Información del Lote"
          icon={<PackageIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
          items={[
            { label: 'Nombre', value: data.batch_info.name },
            { label: 'Código único', value: data.batch_info.unique_code },
            { label: 'Fecha creación', value: new Date(data.batch_info.creation_date).toLocaleDateString('es-MX') },
            { label: 'ID producción', value: data.batch_info.production_id }
          ]}
        />

        <InfoCard
          title="Información del Cultivo"
          icon={<PlantIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
          items={[
            { label: 'Tipo', value: data.crop_info.type },
            { label: 'Variedad', value: data.crop_info.variety },
            { label: 'Fecha de siembra', value: new Date(data.crop_info.planting_date).toLocaleDateString('es-MX') },
            { label: 'Fecha de cosecha', value: new Date(data.crop_info.harvest_date).toLocaleDateString('es-MX') }
          ]}
        />

        <InfoCard
          title="Información del Productor"
          icon={<UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
          items={[
            { label: 'Nombre', value: data.producer_info.name },
            { label: 'Parcela', value: data.producer_info.plot },
            { label: 'Ubicación', value: data.producer_info.location }
          ]}
        />
      </div>

      {/* Actividades recientes */}
      {data.activities && data.activities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actividades Recientes</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {data.activities.slice(0, 3).map((activity, index) => (
                <ActivityPreview key={activity.activity_id} activity={activity} />
              ))}
            </div>
            {data.activities.length > 3 && (
              <div className="mt-3 sm:mt-4 text-center">
                <button
                  onClick={() => setActiveTab('actividades')} // Aquí está el cambio
                  className="text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm"
                >
                  Ver todas las actividades ({data.activities.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de pestaña de Actividades
function ActivitiesTab({ data }) {
  if (!data.activities || data.activities.length === 0) {
    return <EmptyActivitiesState />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Actividades Registradas</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Historial completo de actividades realizadas en el lote</p>
        </div>
        <div className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm">
          <span className="font-semibold">{data.activities.length}</span> actividades registradas
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {data.activities.map((activity, index) => (
          <ActivityCard key={activity.activity_id} activity={activity} />
        ))}
      </div>
    </div>
  )
}

// Componente de pestaña de Detalles
function DetailsTab({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      {/* Información detallada del lote */}
      <div className="space-y-4 sm:space-y-6">
        <SectionCard title="Detalles del Lote de Producción" icon={<PackageIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <DetailGrid items={[
            { label: 'Nombre del Lote', value: data.batch_info.name },
            { label: 'Código Único', value: data.batch_info.unique_code },
            { label: 'ID de Producción', value: data.batch_info.production_id },
            { label: 'Fecha de Creación', value: new Date(data.batch_info.creation_date).toLocaleDateString('es-MX') },
            { label: 'Estado del Lote', value: data.summary.has_activities ? 'Activo' : 'En preparación' }
          ]} />
        </SectionCard>

        <SectionCard title="Información del Productor" icon={<UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <DetailGrid items={[
            { label: 'Nombre', value: data.producer_info.name },
            { label: 'Parcela/Unidad', value: data.producer_info.plot },
            { label: 'Ubicación', value: data.producer_info.location }
          ]} />
        </SectionCard>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <SectionCard title="Detalles del Cultivo" icon={<PlantIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <DetailGrid items={[
            { label: 'Tipo de Cultivo', value: data.crop_info.type },
            { label: 'Variedad', value: data.crop_info.variety },
            { label: 'Fecha de Siembra', value: new Date(data.crop_info.planting_date).toLocaleDateString('es-MX') },
            { label: 'Fecha de Cosecha', value: new Date(data.crop_info.harvest_date).toLocaleDateString('es-MX') },
            { label: 'Duración Total', value: calculateCropDuration(data.crop_info.planting_date, data.crop_info.harvest_date) }
          ]} />
        </SectionCard>

        <SectionCard title="Resumen del Historial" icon={<CheckBadgeIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <DetailGrid items={[
            { label: 'Estado', value: data.summary.has_activities ? 'Completo' : 'Básico' },
            { label: 'Total de Actividades', value: data.summary.total_activities },
            { label: 'Inversión Total', value: `$${parseFloat(data.summary.total_batch_cost).toFixed(2)}` },
            {
              label: 'Última Actualización', value: data.summary.last_activity_date ?
                new Date(data.summary.last_activity_date).toLocaleDateString('es-MX') : 'Sin actividades'
            }
          ]} />
        </SectionCard>
      </div>
    </div>
  )
}

// Componente de pestaña de Métricas
function MetricsTab({ data }) {
  const totalCost = parseFloat(data.summary.total_batch_cost)
  const activityCount = data.summary.total_activities

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Métricas financieras */}
        <SectionCard title="Métricas Financieras" icon={<CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <div className="space-y-3 sm:space-y-4">
            <MetricItem
              label="Inversión Total"
              value={`$${totalCost.toFixed(2)}`}
              description="Costo total acumulado en actividades"
            />
            <MetricItem
              label="Costo Promedio por Actividad"
              value={activityCount > 0 ? `$${(totalCost / activityCount).toFixed(2)}` : '$0.00'}
              description="Inversión promedio por actividad registrada"
            />
            <MetricItem
              label="Actividades Registradas"
              value={activityCount}
              description="Total de actividades en el sistema"
            />
          </div>
        </SectionCard>

        {/* Métricas de tiempo */}
        <SectionCard title="Métricas de Tiempo" icon={<ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
          <div className="space-y-3 sm:space-y-4">
            <MetricItem
              label="Duración del Cultivo"
              value={calculateCropDuration(data.crop_info.planting_date, data.crop_info.harvest_date)}
              description="Período total desde siembra hasta cosecha"
            />
            <MetricItem
              label="Fecha de Inicio"
              value={new Date(data.crop_info.planting_date).toLocaleDateString('es-MX')}
              description="Día de siembra del cultivo"
            />
            <MetricItem
              label="Fecha de Término"
              value={new Date(data.crop_info.harvest_date).toLocaleDateString('es-MX')}
              description="Día estimado de cosecha"
            />
          </div>
        </SectionCard>
      </div>

      {/* Resumen de estado */}
      <SectionCard title="Estado del Sistema" icon={<ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className={`p-3 sm:p-4 rounded-lg ${data.summary.has_activities ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            }`}>
            <div className="flex items-center">
              {data.summary.has_activities ? (
                <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-2 sm:mr-3" />
              ) : (
                <WarningIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 mr-2 sm:mr-3" />
              )}
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Nivel de Historial</h4>
                <p className={`text-xs sm:text-sm ${data.summary.has_activities ? 'text-green-700' : 'text-amber-700'
                  }`}>
                  {data.summary.has_activities ? 'Completo' : 'Básico'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Documentación</h4>
                <p className="text-xs sm:text-sm text-blue-700">
                  {activityCount > 0 ? 'Completa' : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// Componentes de estado
function LoadingState({ uniqueCode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6">Cargando historial</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Buscando información del producto en nuestro sistema</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 font-mono bg-gray-100 px-2 py-1 sm:px-3 sm:py-2 rounded-lg inline-block">
          {uniqueCode}
        </p>
      </div>
    </div>
  )
}

function ErrorState({ error, uniqueCode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <ExclamationTriangleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error al cargar</h1>
        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-500">Código consultado:</p>
          <p className="font-mono text-gray-800 font-semibold text-sm sm:text-base">{uniqueCode}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 w-full text-sm sm:text-base"
        >
          Reintentar carga
        </button>
      </div>
    </div>
  )
}

// Componentes de UI reutilizables
function MetricCard({ title, value, change, icon, color = "gray" }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm">
      <div className="flex items-center">
        <div className={`p-1 sm:p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-2 sm:ml-3 lg:ml-4">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ title, icon, items }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="text-gray-500">{icon}</div>
        <h3 className="ml-2 text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <span className="text-xs sm:text-sm font-medium text-gray-500">{item.label}</span>
            <span className="text-xs sm:text-sm text-gray-900 font-semibold text-right max-w-xs break-words">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-center">
          {icon}
          <h3 className="ml-2 text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}

function ActivityPreview({ activity }) {
  return (
    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="bg-green-100 p-1 sm:p-2 rounded-lg">
          <ClipboardListIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
        </div>
        <div className="ml-2 sm:ml-3">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900">{activity.activity_type}</h4>
          <p className="text-xs text-gray-500">
            {new Date(activity.date).toLocaleDateString('es-MX')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs sm:text-sm font-semibold text-gray-900">
          ${parseFloat(activity.cost_total).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

function ActivityCard({ activity }) {
  const getActivityIcon = (type) => {
    const icons = {
      'Fertilización': <ChemistryIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Riego': <WaterIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Poda': <ScissorsIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Cosecha': <HarvestIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Siembra': <PlantIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      'default': <DocumentIcon className="w-4 h-4 sm:w-5 sm:h-5" />
    }
    return icons[activity.activity_type] || icons.default
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center">
          <div className="bg-green-100 p-1 sm:p-2 rounded-lg">
            {getActivityIcon(activity.activity_type)}
          </div>
          <div className="ml-2 sm:ml-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{activity.activity_type}</h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              {new Date(activity.date).toLocaleDateString('es-MX', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 text-blue-700 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-auto">
          ${parseFloat(activity.cost_total).toFixed(2)}
        </div>
      </div>

      <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{activity.description}</p>

      {activity.inputs && activity.inputs.length > 0 && (
        <div className="border-t border-gray-100 pt-3 sm:pt-4">
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
            <ClipboardIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500" />
            Insumos Utilizados
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {activity.inputs.map((input, inputIndex) => (
              <div key={inputIndex} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-800 text-xs sm:text-sm">{input.input_name}</span>
                  <span className="bg-white px-1 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-semibold text-gray-700">
                    {input.quantity} {input.unit}
                  </span>
                </div>
                {input.unit_cost && (
                  <p className="text-xs text-gray-600 mt-1">
                    Costo unitario: ${parseFloat(input.unit_cost).toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyActivitiesState() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <ClipboardListIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-600" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-amber-800 mb-2">Sin actividades registradas</h3>
      <p className="text-amber-700 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
        Este lote de producción no tiene actividades asociadas. El historial completo estará disponible cuando se agreguen actividades al sistema.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
        <p className="text-xs sm:text-sm text-amber-700">
          <strong>Próximos pasos:</strong> Contacte al administrador del sistema para registrar las actividades realizadas en este lote.
        </p>
      </div>
    </div>
  )
}

function DetailGrid({ items }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex flex-col xs:flex-row xs:justify-between xs:items-start border-b border-gray-100 pb-2 sm:pb-3 last:border-b-0 last:pb-0 gap-1">
          <span className="text-xs sm:text-sm font-medium text-gray-500 flex-1">{item.label}</span>
          <span className="text-xs sm:text-sm text-gray-900 font-semibold text-right flex-1 break-words">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function MetricItem({ label, value, description }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0 gap-1 sm:gap-0">
      <div>
        <p className="font-medium text-gray-900 text-sm sm:text-base">{label}</p>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-base sm:text-lg font-bold text-gray-900 sm:text-right">{value}</span>
    </div>
  )
}

// Funciones auxiliares
function calculateCropDuration(plantingDate, harvestDate) {
  const start = new Date(plantingDate)
  const end = new Date(harvestDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} días`
}

// SVG Icons (sin cambios)
function FarmIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function ChartBarIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function ClipboardListIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}

function DocumentTextIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ChartPieIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  )
}

function CurrencyDollarIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CheckBadgeIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

function UserIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function ClockIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ShieldCheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function ExclamationTriangleIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function CheckCircleIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

function PackageIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function PlantIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  )
}

function CalendarIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ChemistryIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  )
}

function WaterIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  )
}

function ScissorsIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
    </svg>
  )
}

function HarvestIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 013 15.546M7 10V6a3 3 0 013-3h4a3 3 0 013 3v4m-8 4v4m0 0H7m4 0h4m-4 0v4m0-4h4m0 0v4" />
    </svg>
  )
}

function DocumentIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function ClipboardIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}