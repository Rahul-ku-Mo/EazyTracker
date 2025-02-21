const ConversationSkeleton = () => {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 border border-dashed rounded-lg dark:border-zinc-700"
        >
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
          <div className="mt-2 flex items-center">
            <div className="h-3 w-3 bg-gray-200 dark:bg-zinc-700 rounded-full mr-2"></div>
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationSkeleton;