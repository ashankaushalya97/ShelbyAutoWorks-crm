import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Input,
  Button,
  Select,
  Divider,
  Row,
  Col,
  Modal,
  Typography,
  Space,
} from 'antd';
import { PlusOutlined, UserAddOutlined, CarOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import VehicleSelectAsync from '@/components/VehicleSelectAsync';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

const { Text } = Typography;

export default function InvoiceForm({ subTotal = 0, current = null }) {
  return <LoadInvoiceForm subTotal={subTotal} current={current} />;
}

function LoadInvoiceForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const form = Form.useFormInstance();

  const [currentYear] = useState(() => new Date().getFullYear());

  // Preview the next invoice number on the create form
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState('');
  useEffect(() => {
    if (!current) {
      request
        .get({ entity: `invoice/nextNumber?date=${new Date().toISOString()}` })
        .then((res) => {
          if (res?.result?.invoiceNumber) setPreviewInvoiceNumber(res.result.invoiceNumber);
        })
        .catch(() => {});
    }
  }, [current]);

  // Client state — key forces AutoCompleteAsync re-mount when a new client is created inline
  const [selectedClientId, setSelectedClientId] = useState(
    current?.client?._id || current?.client || null
  );
  const [clientInitialValue, setClientInitialValue] = useState(current?.client || null);
  const [clientKey, setClientKey] = useState(0);

  // Vehicle refresh key — increment to force VehicleSelectAsync to refetch
  const [vehicleRefreshKey, setVehicleRefreshKey] = useState(0);

  // Quick-add customer modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [customerForm] = Form.useForm();

  // Quick-add vehicle modal
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleForm] = Form.useForm();

  const addField = useRef(false);

  useEffect(() => {
    if (addField.current) addField.current.click();
  }, []);

  useEffect(() => {
    if (current) {
      const { year, number } = current;
      if (year) form?.setFieldValue?.('year', year);
      if (number) form?.setFieldValue?.('number', number);
    }
  }, [current]);

  const handleAddCustomer = async (values) => {
    setCustomerSaving(true);
    const data = await request.create({ entity: 'client', jsonData: values });
    setCustomerSaving(false);
    if (data?.success && data?.result) {
      const newClient = data.result;
      // Force AutoCompleteAsync to re-mount with the new client pre-selected
      setClientInitialValue(newClient);
      setClientKey((k) => k + 1);
      setSelectedClientId(newClient._id);
      form?.setFieldValue?.('client', newClient._id);
      setCustomerModalOpen(false);
      customerForm.resetFields();
    }
  };

  const handleAddVehicle = async (values) => {
    if (!selectedClientId) return;
    setVehicleSaving(true);
    const data = await request.create({
      entity: 'vehicle',
      jsonData: { ...values, customer: selectedClientId },
    });
    setVehicleSaving(false);
    if (data?.success && data?.result) {
      // Trigger VehicleSelectAsync refetch, then select the new vehicle
      setVehicleRefreshKey((k) => k + 1);
      form?.setFieldValue?.('vehicle', data.result._id);
      setVehicleModalOpen(false);
      vehicleForm.resetFields();
    }
  };

  return (
    <>
      {/* Row 1: Customer + Vehicle */}
      <Row gutter={[12, 0]}>
        <Col span={10}>
          <Form.Item
            name="client"
            label={translate('Customer')}
            rules={[{ required: true, message: 'Please select a customer' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <div style={{ flex: 1 }}>
                <AutoCompleteAsync
                  key={clientKey}
                  entity={'client'}
                  displayLabels={['name']}
                  searchFields={'name'}
                  value={clientInitialValue}
                  onChange={(val) => {
                    setSelectedClientId(val);
                    form?.setFieldValue?.('client', val);
                  }}
                />
              </div>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => setCustomerModalOpen(true)}
                title="Add new customer"
              />
            </Space.Compact>
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item name="vehicle" label="Vehicle">
            <Space.Compact style={{ width: '100%' }}>
              <div style={{ flex: 1 }}>
                <VehicleSelectAsync clientId={selectedClientId} refreshKey={vehicleRefreshKey} />
              </div>
              <Button
                icon={<CarOutlined />}
                disabled={!selectedClientId}
                onClick={() => setVehicleModalOpen(true)}
                title="Add new vehicle"
              />
            </Space.Compact>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name="status" label={translate('Status')} initialValue={'draft'}>
            <Select
              options={[
                { value: 'draft', label: translate('Draft') },
                { value: 'pending', label: translate('Pending') },
                { value: 'sent', label: translate('Sent') },
                { value: 'paid', label: translate('Paid') },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Row 2: Invoice# (read-only) + Payment Method + Date + Due Date */}
      <Row gutter={[12, 0]}>
        <Col span={6}>
          <Form.Item label="Invoice #">
            <Text strong style={{ fontSize: 14, lineHeight: '32px', display: 'block', color: '#1677ff' }}>
              {current?.invoiceNumber || previewInvoiceNumber || '…'}
            </Text>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="paymentMethod" label="Payment Method" initialValue="cash">
            <Select
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[{ required: true, type: 'object' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="expiredDate"
            label="Due Date"
            rules={[{ required: true, type: 'object' }]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
      </Row>

      {/* Row 3: Notes */}
      <Row gutter={[12, 0]}>
        <Col span={24}>
          <Form.Item label={translate('Note')} name="notes">
            <Input placeholder="Any notes about this job..." />
          </Form.Item>
        </Col>
      </Row>

      {/* Hidden fields required by backend */}
      <Form.Item name="number" hidden initialValue={1}>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name="year" hidden initialValue={currentYear}>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name="taxRate" hidden initialValue={0}>
        <Input type="hidden" />
      </Form.Item>

      <Divider dashed />

      {/* Items table */}
      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col span={6}><p>{translate('Item')}</p></Col>
        <Col span={8}><p>{translate('Description')}</p></Col>
        <Col span={3}><p>{translate('Quantity')}</p></Col>
        <Col span={4}><p>{translate('Price')}</p></Col>
        <Col span={3}><p>{translate('Total')}</p></Col>
      </Row>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow key={field.key} remove={remove} field={field} current={current} />
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate('Add field')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Divider dashed />

      {/* Total — right-aligned plain display, no editable input */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 32, paddingBottom: 16 }}>
        <Text strong style={{ fontSize: 16, marginRight: 12 }}>Total:</Text>
        <Text strong style={{ fontSize: 16, minWidth: 140, textAlign: 'right' }}>
          LKR {Number(subTotal || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
        </Text>
      </div>

      {/* Quick-add Customer Modal */}
      <Modal
        title={<><UserAddOutlined /> Add New Customer</>}
        open={customerModalOpen}
        onCancel={() => { setCustomerModalOpen(false); customerForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={customerForm} layout="vertical" onFinish={handleAddCustomer}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input placeholder="First name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Last name" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="077 123 4567" />
          </Form.Item>
          <Form.Item name="email" label="Email (optional)">
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setCustomerModalOpen(false); customerForm.resetFields(); }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={customerSaving}>
                Save Customer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Quick-add Vehicle Modal */}
      <Modal
        title={<><CarOutlined /> Add New Vehicle</>}
        open={vehicleModalOpen}
        onCancel={() => { setVehicleModalOpen(false); vehicleForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={vehicleForm} layout="vertical" onFinish={handleAddVehicle}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="make" label="Make" rules={[{ required: true }]}>
                <Input placeholder="e.g. Toyota" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="model" label="Model" rules={[{ required: true }]}>
                <Input placeholder="e.g. Hilux" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="licensePlate" label="Licence Plate" rules={[{ required: true }]}>
                <Input placeholder="ABC-1234" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="year" label="Year">
                <Input placeholder="e.g. 2019" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setVehicleModalOpen(false); vehicleForm.resetFields(); }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={vehicleSaving}>
                Save Vehicle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
