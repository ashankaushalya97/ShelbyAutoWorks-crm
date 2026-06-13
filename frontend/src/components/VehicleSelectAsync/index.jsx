import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { request } from '@/request';

// refreshKey: increment this from outside to force a refetch (e.g. after adding a vehicle inline)
export default function VehicleSelectAsync({ clientId, value, onChange, refreshKey = 0 }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setOptions([]);
      return;
    }
    setLoading(true);
    request
      .listAll({ entity: 'vehicle', options: { client: clientId } })
      .then((data) => {
        setOptions(data?.result || []);
        setLoading(false);
      })
      .catch(() => {
        setOptions([]);
        setLoading(false);
      });
  }, [clientId, refreshKey]);

  return (
    <Select
      loading={loading}
      disabled={!clientId || loading}
      value={value}
      onChange={onChange}
      placeholder={clientId ? 'Select vehicle (optional)' : 'Select a customer first'}
      allowClear
      style={{ width: '100%' }}
    >
      {options.map((v) => (
        <Select.Option key={v._id} value={v._id}>
          {v.make} {v.model} {v.year ? `(${v.year})` : ''} — {v.licensePlate}
        </Select.Option>
      ))}
    </Select>
  );
}
