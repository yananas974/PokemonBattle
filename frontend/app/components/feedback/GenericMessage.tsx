import type { FC } from 'react';
import StatusMessage from './StatusMessage';

interface GenericMessageProps {
  title?: string;
  message: string;
}

const GenericSuccessMessage: FC<GenericMessageProps> = ({ title = 'Succès', message }) => (
  <StatusMessage type="success" title={title} message={message} />
);

const GenericErrorMessage: FC<GenericMessageProps> = ({ title = 'Erreur', message }) => (
  <StatusMessage type="error" title={title} message={message} />
);

const GenericInfoMessage: FC<GenericMessageProps> = ({ title = 'Information', message }) => (
  <StatusMessage type="info" title={title} message={message} />
);

const GenericWarningMessage: FC<GenericMessageProps> = ({ title = 'Attention', message }) => (
  <StatusMessage type="warning" title={title} message={message} />
);

export { GenericSuccessMessage, GenericErrorMessage, GenericInfoMessage, GenericWarningMessage };