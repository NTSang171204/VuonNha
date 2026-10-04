'use client';

import { Card, Empty, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SettingsStubPage() {
  return (
    <Card>
      <Empty
        image={<SettingOutlined style={{ fontSize: 48, color: '#9CA3AF' }} />}
        description={
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>
              Cài đặt
            </Title>
            <Text type="secondary">
              Tính năng đang phát triển. Cấu hình hệ thống sẽ được bổ sung sau.
            </Text>
          </div>
        }
      />
    </Card>
  );
}
