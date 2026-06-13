import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';
import PageLoader from '@/components/PageLoader';

import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';


export default function ReadInvoiceModule({ config }) {
  const dispatch = useDispatch();
  const { id } = useParams();

  useLayoutEffect(() => {
    dispatch(erp.read({ entity: config.entity, id }));
  }, [id]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  const handlePrint = () => {
    const auth = storePersist.get('auth');
    const token = auth?.current?.token;
    window.open(`${API_BASE_URL}invoice/print/${id}?token=${token}`, '_blank');
  };

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  }

  return (
    <ErpLayout>
      {isSuccess ? (
        <>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} size="large">
              Print Bill
            </Button>
          </div>
          <ReadItem config={config} selectedItem={currentResult} />
        </>
      ) : (
        <NotFound entity={config.entity} />
      )}
    </ErpLayout>
  );
}
