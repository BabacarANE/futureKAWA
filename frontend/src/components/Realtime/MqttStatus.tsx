export default function MqttStatus({ connected }: { connected: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
      <span className={`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
      <span>{connected ? 'MQTT: connecté' : 'MQTT: déconnecté'}</span>
    </div>
  )
}
