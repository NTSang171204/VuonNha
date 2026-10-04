'use client';

import { Card, Empty, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function CustomersStubPage() {
  return (
    <Card>
      <Empty
        image={<TeamOutlined style={{ fontSize: 48, color: '#9CA3AF' }} />}
        description={
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>
              Khách hàng
            </Title>
            <Text type="secondary">
              Tính năng đang phát triển. Sẽ sớm hỗ trợ quản lý khách hàng
              B2B/B2C.
            </Text>
          </div>
        }
      />
    </Card>
  );
}
