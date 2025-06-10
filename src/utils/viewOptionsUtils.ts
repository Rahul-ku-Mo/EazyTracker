import { ViewOptions } from '@/store/useViewOptionsStore';

export interface CardItem {
  id: number;
  title: string;
  order: number;
  description: string;
  columnId: number;
  labels: string[];
  attachments: any[];
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  createdAt: string;
  dueDate: string | null;
  updatedAt: string;
  creatorId: number | null;
  assigneeId?: string | null;
}

export interface Column {
  id: number;
  title: string;
  order: number;
  cards: CardItem[];
}

// Filter cards based on view options
export const filterCards = (cards: CardItem[], viewOptions: ViewOptions): CardItem[] => {
  let filteredCards = [...cards];

  // Filter by priority
  if (viewOptions.activeFilters.priority.length > 0) {
    filteredCards = filteredCards.filter(card => 
      card.priority && viewOptions.activeFilters.priority.includes(card.priority)
    );
  }

  // Filter by assignee
  if (viewOptions.activeFilters.assignee.length > 0) {
    filteredCards = filteredCards.filter(card => 
      card.assigneeId && viewOptions.activeFilters.assignee.includes(card.assigneeId)
    );
  }

  // Filter by due date
  if (viewOptions.activeFilters.dueDate !== 'none') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    filteredCards = filteredCards.filter(card => {
      if (!card.dueDate) return false;
      const cardDueDate = new Date(card.dueDate);

      switch (viewOptions.activeFilters.dueDate) {
        case 'overdue':
          return cardDueDate < today;
        case 'today':
          return cardDueDate >= today && cardDueDate < tomorrow;
        case 'thisWeek':
          return cardDueDate >= today && cardDueDate <= weekFromNow;
        case 'thisMonth':
          return cardDueDate >= today && cardDueDate <= monthFromNow;
        default:
          return true;
      }
    });
  }

  return filteredCards;
};

// Order cards based on view options
export const orderCards = (cards: CardItem[], viewOptions: ViewOptions): CardItem[] => {
  const sortedCards = [...cards];

  const getSortValue = (card: CardItem): any => {
    switch (viewOptions.orderBy) {
      case 'title':
        return card.title.toLowerCase();
      case 'created':
        return new Date(card.createdAt).getTime();
      case 'updated':
        return new Date(card.updatedAt).getTime();
      case 'priority': {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[card.priority as keyof typeof priorityOrder] || 0;
      }
      case 'dueDate':
        return card.dueDate ? new Date(card.dueDate).getTime() : Infinity;
      case 'manual':
      default:
        return card.order;
    }
  };

  sortedCards.sort((a, b) => {
    const aValue = getSortValue(a);
    const bValue = getSortValue(b);

    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return viewOptions.orderDirection === 'desc' ? -comparison : comparison;
  });

  return sortedCards;
};

// Group cards based on view options
export const groupCards = (cards: CardItem[], columns: Column[], viewOptions: ViewOptions) => {
  const processedCards = orderCards(filterCards(cards, viewOptions), viewOptions);

  switch (viewOptions.groupBy) {
    case 'priority':
      return groupByPriority(processedCards, viewOptions);
    case 'assignee':
      return groupByAssignee(processedCards, viewOptions);
    case 'dueDate':
      return groupByDueDate(processedCards, viewOptions);
    case 'none':
      return { 'All Cards': { id: 0, cards: processedCards } };
    case 'column':
    default:
      return groupByColumn(processedCards, columns, viewOptions);
  }
};

const groupByColumn = (cards: CardItem[], columns: Column[], viewOptions: ViewOptions) => {
  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};

  // Initialize all columns
  columns.forEach(column => {
    grouped[column.title] = { id: column.id, cards: [] };
  });

  // Group cards by column
  cards.forEach(card => {
    const column = columns.find(col => col.id === card.columnId);
    if (column) {
      grouped[column.title].cards.push(card);
    }
  });

  // Remove empty groups if option is disabled
  if (!viewOptions.showEmptyGroups) {
    Object.keys(grouped).forEach(key => {
      if (grouped[key].cards.length === 0) {
        delete grouped[key];
      }
    });
  }

  return grouped;
};

const groupByPriority = (cards: CardItem[], viewOptions: ViewOptions) => {
  const priorities = ['urgent', 'high', 'medium', 'low', 'none'];
  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};

  priorities.forEach((priority, index) => {
    const priorityCards = cards.filter(card => 
      priority === 'none' ? !card.priority : card.priority === priority
    );
    
    if (priorityCards.length > 0 || viewOptions.showEmptyGroups) {
      const displayName = priority === 'none' ? 'No Priority' : priority.charAt(0).toUpperCase() + priority.slice(1);
      grouped[displayName] = { id: index, cards: priorityCards };
    }
  });

  return grouped;
};

const groupByAssignee = (cards: CardItem[], viewOptions: ViewOptions) => {
  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};
  let groupId = 0;

  // Get unique assignees
  const assignees = Array.from(new Set(cards.map(card => card.assigneeId).filter(Boolean)));
  
  assignees.forEach(assigneeId => {
    const assigneeCards = cards.filter(card => card.assigneeId === assigneeId);
    if (assigneeCards.length > 0 || viewOptions.showEmptyGroups) {
      grouped[`Assignee ${assigneeId}`] = { id: groupId++, cards: assigneeCards };
    }
  });

  // Add unassigned cards
  const unassignedCards = cards.filter(card => !card.assigneeId);
  if (unassignedCards.length > 0 || viewOptions.showEmptyGroups) {
    grouped['Unassigned'] = { id: groupId++, cards: unassignedCards };
  }

  return grouped;
};

const groupByDueDate = (cards: CardItem[], viewOptions: ViewOptions) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const groups = [
    { name: 'Overdue', cards: [] as CardItem[] },
    { name: 'Due Today', cards: [] as CardItem[] },
    { name: 'Due This Week', cards: [] as CardItem[] },
    { name: 'Due Later', cards: [] as CardItem[] },
    { name: 'No Due Date', cards: [] as CardItem[] },
  ];

  cards.forEach(card => {
    if (!card.dueDate) {
      groups[4].cards.push(card);
      return;
    }

    const cardDueDate = new Date(card.dueDate);
    if (cardDueDate < today) {
      groups[0].cards.push(card);
    } else if (cardDueDate >= today && cardDueDate < tomorrow) {
      groups[1].cards.push(card);
    } else if (cardDueDate >= tomorrow && cardDueDate <= weekFromNow) {
      groups[2].cards.push(card);
    } else {
      groups[3].cards.push(card);
    }
  });

  const grouped: { [key: string]: { id: number; cards: CardItem[] } } = {};
  groups.forEach((group, index) => {
    if (group.cards.length > 0 || viewOptions.showEmptyGroups) {
      grouped[group.name] = { id: index, cards: group.cards };
    }
  });

  return grouped;
};

// Generate realistic dummy data for testing and demo purposes
export const generateDummyData = (): { columns: Column[]; cards: CardItem[] } => {
  const columns: Column[] = [
    { id: 1, title: 'Backlog', order: 1, cards: [] },
    { id: 2, title: 'In Progress', order: 2, cards: [] },
    { id: 3, title: 'Review', order: 3, cards: [] },
    { id: 4, title: 'Done', order: 4, cards: [] }
  ];

  const assignees = [
    'alex.chen@company.com',
    'sarah.johnson@company.com', 
    'michael.rodriguez@company.com',
    'emma.davis@company.com',
    'david.wilson@company.com',
    'lisa.anderson@company.com'
  ];

  // const priorities: ('urgent' | 'high' | 'medium' | 'low')[] = ['urgent', 'high', 'medium', 'low'];
  
  // const labelSets = [
  //   ['Frontend', 'React', 'UI'],
  //   ['Backend', 'API', 'Database'],
  //   ['Design', 'UX', 'Research'],
  //   ['DevOps', 'CI/CD', 'Infrastructure'],
  //   ['Bug', 'Critical', 'Hotfix'],
  //   ['Feature', 'Enhancement', 'New'],
  //   ['Documentation', 'Guide', 'Tutorial'],
  //   ['Testing', 'QA', 'Automation'],
  //   ['Security', 'Authentication', 'Authorization'],
  //   ['Performance', 'Optimization', 'Speed']
  // ];

  const cards: CardItem[] = [
    {
      id: 1,
      title: 'Implement User Authentication System',
      description: 'Design and develop a comprehensive user authentication system with OAuth 2.0 integration, multi-factor authentication support, and secure session management. This includes creating login/register pages, password reset functionality, email verification, and integration with third-party providers like Google and GitHub. The system should also include proper error handling, rate limiting, and security best practices to prevent common attacks like brute force and session hijacking.',
      order: 1,
      columnId: 1,
      labels: ['Backend', 'Security', 'Authentication'],
      attachments: [],
      priority: 'urgent',
      createdAt: '2024-01-15T10:00:00Z',
      dueDate: '2024-02-01T17:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      creatorId: 1,
      assigneeId: 'alex.chen@company.com'
    },
    {
      id: 2,
      title: 'Design Dashboard Analytics UI',
      description: 'Create a modern, responsive dashboard interface that displays key performance metrics and analytics data. The design should include interactive charts, real-time data visualization, customizable widgets, and drill-down capabilities. Focus on user experience with intuitive navigation, accessible color schemes, and mobile-first responsive design. Include dark mode support, export functionality for reports, and integration with our existing design system components.',
      order: 2,
      columnId: 2,
      labels: ['Frontend', 'Design', 'Analytics'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-16T09:30:00Z',
      dueDate: '2024-01-30T15:00:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      creatorId: 2,
      assigneeId: 'sarah.johnson@company.com'
    },
    {
      id: 3,
      title: 'Optimize Database Performance',
      description: 'Conduct comprehensive database performance optimization including query analysis, index optimization, and database schema improvements. Identify slow-running queries, implement proper indexing strategies, and optimize data retrieval patterns. This task involves setting up monitoring tools, analyzing query execution plans, implementing database connection pooling, and establishing performance benchmarks. Expected outcome is 40% improvement in query response times and reduced server load.',
      order: 3,
      columnId: 2,
      labels: ['Backend', 'Database', 'Performance'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-14T11:15:00Z',
      dueDate: '2024-01-28T12:00:00Z',
      updatedAt: '2024-01-17T16:45:00Z',
      creatorId: 3,
      assigneeId: 'michael.rodriguez@company.com'
    },
    {
      id: 4,
      title: 'Mobile App Responsive Design',
      description: 'Develop responsive design components for the mobile application ensuring seamless user experience across different screen sizes and devices. This includes implementing touch-friendly interfaces, optimizing loading times, creating adaptive layouts, and ensuring accessibility compliance. The design should maintain brand consistency while adapting to various mobile platforms including iOS and Android with proper gesture support and native-like interactions.',
      order: 4,
      columnId: 1,
      labels: ['Frontend', 'Mobile', 'UX'],
      attachments: [],
      priority: 'medium',
      createdAt: '2024-01-17T08:45:00Z',
      dueDate: '2024-02-15T18:00:00Z',
      updatedAt: '2024-01-17T08:45:00Z',
      creatorId: 4,
      assigneeId: 'emma.davis@company.com'
    },
    {
      id: 5,
      title: 'API Rate Limiting Implementation',
      description: 'Implement robust API rate limiting to prevent abuse and ensure fair usage across all client applications. This includes designing flexible rate limiting algorithms, implementing token bucket and sliding window approaches, creating rate limit headers for API responses, and building administrative tools for monitoring and adjusting limits. The solution should handle burst traffic gracefully while maintaining system stability and providing clear feedback to API consumers.',
      order: 5,
      columnId: 3,
      labels: ['Backend', 'API', 'Security'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-12T13:20:00Z',
      dueDate: '2024-01-25T16:30:00Z',
      updatedAt: '2024-01-18T10:15:00Z',
      creatorId: 5,
      assigneeId: 'david.wilson@company.com'
    },
    {
      id: 6,
      title: 'User Onboarding Flow Enhancement',
      description: 'Redesign the user onboarding experience to improve user retention and reduce time-to-value for new users. This involves creating interactive tutorials, progress indicators, contextual help systems, and personalized setup workflows. Include A/B testing framework to measure onboarding effectiveness, implement user analytics tracking, and create adaptive flows based on user roles and use cases. The goal is to achieve 80% onboarding completion rate.',
      order: 6,
      columnId: 1,
      labels: ['UX', 'Frontend', 'Analytics'],
      attachments: [],
      priority: 'medium',
      createdAt: '2024-01-18T07:30:00Z',
      dueDate: '2024-02-10T14:00:00Z',
      updatedAt: '2024-01-18T07:30:00Z',
      creatorId: 6,
      assigneeId: 'lisa.anderson@company.com'
    },
    {
      id: 7,
      title: 'Critical Security Vulnerability Fix',
      description: 'Address critical security vulnerability in the authentication module that could potentially allow unauthorized access to user accounts. This high-priority issue requires immediate attention including patch development, security testing, deployment coordination, and user communication. The fix involves updating encryption algorithms, strengthening session validation, and implementing additional security headers. All changes must be thoroughly tested and deployed with zero downtime.',
      order: 7,
      columnId: 2,
      labels: ['Security', 'Critical', 'Hotfix'],
      attachments: [],
      priority: 'urgent',
      createdAt: '2024-01-19T15:45:00Z',
      dueDate: '2024-01-22T09:00:00Z',
      updatedAt: '2024-01-19T16:20:00Z',
      creatorId: 1,
      assigneeId: 'alex.chen@company.com'
    },
    {
      id: 8,
      title: 'Real-time Notifications System',
      description: 'Build a comprehensive real-time notification system using WebSocket technology to deliver instant updates to users across web and mobile platforms. The system should support multiple notification types, user preferences management, notification history, and delivery guarantees. Include features like push notifications, email fallbacks, notification batching, and user status awareness. Ensure scalability to handle thousands of concurrent connections efficiently.',
      order: 8,
      columnId: 1,
      labels: ['Backend', 'Real-time', 'WebSocket'],
      attachments: [],
      priority: 'medium',
      createdAt: '2024-01-16T12:00:00Z',
      dueDate: '2024-02-05T17:00:00Z',
      updatedAt: '2024-01-19T11:30:00Z',
      creatorId: 2,
      assigneeId: 'sarah.johnson@company.com'
    },
    {
      id: 9,
      title: 'Automated Testing Suite Setup',
      description: 'Establish comprehensive automated testing infrastructure including unit tests, integration tests, and end-to-end testing pipelines. This involves setting up testing frameworks, creating test data management systems, implementing continuous integration workflows, and establishing code coverage requirements. The suite should include visual regression testing, API testing, performance testing, and automated deployment verification to ensure code quality and reliability.',
      order: 9,
      columnId: 3,
      labels: ['Testing', 'CI/CD', 'QA'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-13T14:15:00Z',
      dueDate: '2024-01-27T13:00:00Z',
      updatedAt: '2024-01-18T09:45:00Z',
      creatorId: 3,
      assigneeId: 'michael.rodriguez@company.com'
    },
    {
      id: 10,
      title: 'Data Export Functionality',
      description: 'Implement comprehensive data export capabilities allowing users to export their data in multiple formats including CSV, Excel, JSON, and PDF. The feature should support filtered exports, scheduled exports, large dataset handling with streaming, and customizable export templates. Include proper data sanitization, user permission checking, export history tracking, and progress indicators for long-running exports. Ensure GDPR compliance for data exports.',
      order: 10,
      columnId: 4,
      labels: ['Feature', 'Backend', 'Data'],
      attachments: [],
      priority: 'low',
      createdAt: '2024-01-10T16:30:00Z',
      dueDate: '2024-02-20T12:00:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      creatorId: 4,
      assigneeId: 'emma.davis@company.com'
    },
    {
      id: 11,
      title: 'Search Engine Optimization',
      description: 'Optimize the application for search engines to improve organic discovery and user acquisition. This includes implementing proper meta tags, structured data markup, sitemap generation, page speed optimization, and content optimization strategies. Focus on technical SEO aspects like server-side rendering, lazy loading, image optimization, and mobile-first indexing. Create comprehensive SEO monitoring and reporting dashboards to track performance improvements.',
      order: 11,
      columnId: 1,
      labels: ['SEO', 'Frontend', 'Performance'],
      attachments: [],
      priority: 'low',
      createdAt: '2024-01-20T10:15:00Z',
      dueDate: '2024-03-01T15:00:00Z',
      updatedAt: '2024-01-20T10:15:00Z',
      creatorId: 5,
      assigneeId: 'david.wilson@company.com'
    },
    {
      id: 12,
      title: 'Payment Gateway Integration',
      description: 'Integrate multiple payment gateways including Paddle, PayPal, and Apple Pay to provide flexible payment options for users. Implementation should include secure payment processing, webhook handling, subscription management, refund processing, and comprehensive error handling. Ensure PCI compliance, implement fraud detection, create payment analytics dashboards, and support multiple currencies. Include thorough testing with sandbox environments.',
      order: 12,
      columnId: 2,
      labels: ['Backend', 'Payment', 'Integration'],
      attachments: [],
      priority: 'urgent',
      createdAt: '2024-01-11T09:00:00Z',
      dueDate: '2024-01-26T17:00:00Z',
      updatedAt: '2024-01-19T13:45:00Z',
      creatorId: 6,
      assigneeId: 'lisa.anderson@company.com'
    },
    {
      id: 13,
      title: 'API Documentation Portal',
      description: 'Create an interactive API documentation portal using modern documentation tools like Swagger/OpenAPI. The portal should include code examples, interactive testing capabilities, authentication guides, rate limiting information, and SDK downloads. Implement automated documentation generation from code comments, version management, community feedback systems, and comprehensive getting-started guides for developers to easily integrate with our APIs.',
      order: 13,
      columnId: 4,
      labels: ['Documentation', 'API', 'Developer'],
      attachments: [],
      priority: 'medium',
      createdAt: '2024-01-09T11:45:00Z',
      dueDate: '2024-02-12T16:00:00Z',
      updatedAt: '2024-01-16T08:30:00Z',
      creatorId: 1,
      assigneeId: 'alex.chen@company.com'
    },
    {
      id: 14,
      title: 'Microservices Architecture Migration',
      description: 'Plan and execute migration from monolithic architecture to microservices to improve scalability, maintainability, and deployment flexibility. This involves service decomposition analysis, API design, data migration strategies, inter-service communication patterns, and deployment orchestration. Include comprehensive monitoring, logging, and error handling across services. Ensure zero-downtime migration with proper rollback strategies and gradual traffic shifting.',
      order: 14,
      columnId: 1,
      labels: ['Architecture', 'Backend', 'DevOps'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-08T13:30:00Z',
      dueDate: '2024-03-15T12:00:00Z',
      updatedAt: '2024-01-18T15:10:00Z',
      creatorId: 2,
      assigneeId: 'sarah.johnson@company.com'
    },
    {
      id: 15,
      title: 'Advanced Analytics Dashboard',
      description: 'Develop sophisticated analytics dashboard with machine learning insights, predictive analytics, and customizable reporting capabilities. The dashboard should provide real-time data visualization, trend analysis, user behavior insights, and business intelligence features. Include drag-and-drop dashboard builder, automated report generation, data filtering and segmentation, export capabilities, and integration with external analytics tools for comprehensive business intelligence.',
      order: 15,
      columnId: 3,
      labels: ['Analytics', 'ML', 'Dashboard'],
      attachments: [],
      priority: 'medium',
      createdAt: '2024-01-21T08:20:00Z',
      dueDate: '2024-02-28T14:30:00Z',
      updatedAt: '2024-01-21T08:20:00Z',
      creatorId: 3,
      assigneeId: 'michael.rodriguez@company.com'
    },
    {
      id: 16,
      title: 'Customer Support Chat Integration',
      description: 'Implement comprehensive customer support chat system with AI-powered chatbot capabilities, human agent escalation, and multi-channel support including web, mobile, and email integration. Features should include conversation history, file sharing, screen sharing, real-time typing indicators, customer satisfaction surveys, and integration with existing CRM systems. Ensure 24/7 availability with intelligent routing and priority queuing.',
      order: 16,
      columnId: 1,
      labels: ['Support', 'AI', 'Chat'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-22T07:45:00Z',
      dueDate: '2024-02-18T16:00:00Z',
      updatedAt: '2024-01-22T07:45:00Z',
      creatorId: 4,
      assigneeId: 'emma.davis@company.com'
    },
    {
      id: 17,
      title: 'Internationalization Implementation',
      description: 'Implement comprehensive internationalization (i18n) support for multiple languages and regions including text translation, date/time formatting, currency handling, and right-to-left language support. This involves creating translation management workflows, implementing dynamic language switching, handling plural forms and gender-specific translations, and ensuring proper text expansion for different languages. Include automated translation tools and community translation platforms.',
      order: 17,
      columnId: 4,
      labels: ['i18n', 'Frontend', 'Global'],
      attachments: [],
      priority: 'low',
      createdAt: '2024-01-05T12:10:00Z',
      dueDate: '2024-03-10T11:00:00Z',
      updatedAt: '2024-01-20T16:25:00Z',
      creatorId: 5,
      assigneeId: 'david.wilson@company.com'
    },
    {
      id: 18,
      title: 'Content Management System',
      description: 'Build flexible content management system with WYSIWYG editor, media management, version control, and workflow approval processes. The system should support multiple content types, SEO optimization, scheduled publishing, content templates, and collaborative editing. Include advanced features like content staging, A/B testing for content, analytics integration, and multi-site management capabilities for scalable content operations.',
      order: 18,
      columnId: 2,
      labels: ['CMS', 'Content', 'Editor'],
      attachments: [],
      priority: 'medium',
      createdAt: '2024-01-23T14:00:00Z',
      dueDate: '2024-02-25T13:30:00Z',
      updatedAt: '2024-01-23T14:00:00Z',
      creatorId: 6,
      assigneeId: 'lisa.anderson@company.com'
    },
    {
      id: 19,
      title: 'Infrastructure Monitoring Setup',
      description: 'Establish comprehensive infrastructure monitoring and alerting system using modern observability tools. This includes server monitoring, application performance monitoring, log aggregation, distributed tracing, and automated alerting workflows. Implement dashboards for different stakeholder groups, SLA monitoring, capacity planning tools, and incident response automation. Ensure proactive issue detection and resolution with minimal manual intervention.',
      order: 19,
      columnId: 3,
      labels: ['DevOps', 'Monitoring', 'Infrastructure'],
      attachments: [],
      priority: 'high',
      createdAt: '2024-01-07T16:40:00Z',
      dueDate: '2024-01-29T10:00:00Z',
      updatedAt: '2024-01-21T12:15:00Z',
      creatorId: 1,
      assigneeId: 'alex.chen@company.com'
    },
    {
      id: 20,
      title: 'Social Media Integration',
      description: 'Develop social media integration features allowing users to connect their social accounts, share content, and import data from various social platforms. This includes OAuth integration with major social networks, content scheduling tools, social analytics tracking, and automated posting capabilities. Ensure compliance with platform APIs, implement proper rate limiting, and create engaging social sharing experiences with rich media support.',
      order: 20,
      columnId: 4,
      labels: ['Social', 'Integration', 'API'],
      attachments: [],
      priority: 'low',
      createdAt: '2024-01-24T09:25:00Z',
      dueDate: '2024-03-05T15:45:00Z',
      updatedAt: '2024-01-24T09:25:00Z',
      creatorId: 2,
      assigneeId: 'sarah.johnson@company.com'
    }
  ];

  // Distribute cards to columns
  columns.forEach(column => {
    column.cards = cards.filter(card => card.columnId === column.id);
  });

  console.log('Generated realistic dummy data:', {
    totalCards: cards.length,
    cardsByColumn: columns.map(col => ({
      name: col.title,
      count: col.cards.length
    })),
    priorityDistribution: {
      urgent: cards.filter(c => c.priority === 'urgent').length,
      high: cards.filter(c => c.priority === 'high').length,
      medium: cards.filter(c => c.priority === 'medium').length,
      low: cards.filter(c => c.priority === 'low').length,
    },
    assigneeDistribution: assignees.map(assignee => ({
      email: assignee,
      count: cards.filter(c => c.assigneeId === assignee).length
    }))
  });

  return { columns, cards };
}; 