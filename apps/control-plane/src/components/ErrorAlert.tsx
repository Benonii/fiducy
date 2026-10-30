import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorAlertProps {
  error: Error | null;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <Alert variant="error">
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
