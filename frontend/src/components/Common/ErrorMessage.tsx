const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
    {message}
  </div>
);

export default ErrorMessage; 