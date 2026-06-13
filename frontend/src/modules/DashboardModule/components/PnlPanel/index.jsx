import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Table, Divider, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '@/request';

const { Text } = Typography;

const fmt = (n) =>
  `LKR ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

const trendColumns = [
  { title: 'Month', dataIndex: 'month', key: 'month' },
  { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: fmt, align: 'right' },
  { title: 'Expenses', dataIndex: 'expenses', key: 'expenses', render: fmt, align: 'right' },
  {
    title: 'Net Profit',
    dataIndex: 'netProfit',
    key: 'netProfit',
    align: 'right',
    render: (v) => <Text style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>{fmt(v)}</Text>,
  },
];

export default function PnlPanel() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    request
      .get({ entity: `dashboard/pnl?month=${month}` })
      .then((res) => {
        if (res?.result) setData(res.result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [month]);

  return (
    <Card
      title={
        <Row justify="space-between" align="middle">
          <Col>Monthly P&L</Col>
          <Col>
            <DatePicker
              picker="month"
              value={dayjs(month)}
              onChange={(d) => d && setMonth(d.format('YYYY-MM'))}
              allowClear={false}
            />
          </Col>
        </Row>
      }
      loading={loading}
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Statistic
            title="Total Revenue"
            value={data?.totalRevenue || 0}
            prefix="LKR"
            precision={2}
            valueStyle={{ color: '#3f8600' }}
            suffix={<ArrowUpOutlined />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Total Expenses"
            value={data?.totalExpenses || 0}
            prefix="LKR"
            precision={2}
            valueStyle={{ color: '#cf1322' }}
            suffix={<ArrowDownOutlined />}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="Net Profit"
            value={data?.netProfit || 0}
            prefix="LKR"
            precision={2}
            valueStyle={{ color: (data?.netProfit || 0) >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" title="Mechanic's Share (50%)">
            <Text strong style={{ fontSize: 16 }}>{fmt(data?.mechanicShare)}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" title="Partner 1 Share (25%)">
            <Text strong style={{ fontSize: 16 }}>{fmt(data?.partnerShare)}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" title="Partner 2 Share (25%)">
            <Text strong style={{ fontSize: 16 }}>{fmt(data?.partnerShare)}</Text>
          </Card>
        </Col>
      </Row>

      <Divider />

      <p style={{ fontWeight: 600, marginBottom: 8 }}>Last 6 Months</p>
      <Table
        dataSource={data?.trend || []}
        columns={trendColumns}
        rowKey="month"
        pagination={false}
        size="small"
      />
    </Card>
  );
}
