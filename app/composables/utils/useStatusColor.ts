export const useStatusColor = () => {
  const getStatusBackgroundColor = (status: string): string => {
    const normalizedStatus = status?.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'success':
      case 'completed':
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      
      case 'failed':
      case 'rejected':
      case 'error':
      case 'declined':
        return 'bg-red-100 text-red-800';
      
      case 'pending':
      case 'processing':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      
      case 'cancelled':
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      
      default:
        return 'bg-blue-100 text-blue-800'; // Default using primary color tint
    }
  };

  const getStatusTextColor = (status: string): string => {
    const normalizedStatus = status?.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'success':
      case 'completed':
      case 'approved':
      case 'active':
        return 'text-green-800';
      
      case 'failed':
      case 'rejected':
      case 'error':
      case 'declined':
        return 'text-red-800';
      
      case 'pending':
      case 'processing':
      case 'in_progress':
        return 'text-yellow-800';
      
      case 'cancelled':
      case 'inactive':
        return 'text-gray-800';
      
      default:
        return 'text-blue-800';
    }
  };

  return {
    getStatusBackgroundColor,
    getStatusTextColor
  };
};
