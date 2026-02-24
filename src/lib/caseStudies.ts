export type CaseStudy = {
  slug: string;
  garageName: string;
  city: string;
  state: string;
  yearsInBusiness: number;
  technicians: number;
  monthlyCars: number;
  before: string[];
  after: string[];
  results: string[];
  quote: string;
  ownerName: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'lone-star-auto-tx',
    garageName: 'Lone Star Auto Care',
    city: 'Austin',
    state: 'Texas',
    yearsInBusiness: 14,
    technicians: 7,
    monthlyCars: 390,
    before: [
      'Work orders were tracked with paper and text messages.',
      'Customers waited too long for job updates and approvals.',
      'Daily revenue was only checked at end of week.'
    ],
    after: [
      'Moved all work orders into one GARIXO dashboard.',
      'Service advisors sent approvals quickly from one screen.',
      'Owner reviewed live jobs and revenue every day.'
    ],
    results: [
      'Revenue up 21% in 4 months',
      'Average repair time down 18%',
      'Approval wait time down 42%'
    ],
    quote:
      'GARIXO gave us a simple daily system. My team works faster, and I finally know what is happening in the shop at all times.',
    ownerName: 'Mark Reynolds'
  },
  {
    slug: 'coastal-motors-fl',
    garageName: 'Coastal Motors Service',
    city: 'Tampa',
    state: 'Florida',
    yearsInBusiness: 9,
    technicians: 5,
    monthlyCars: 280,
    before: [
      'Inventory counts were often wrong at the busiest hours.',
      'Technician workload was not balanced clearly.',
      'Front desk spent too much time checking job status.'
    ],
    after: [
      'Inventory and service status were tracked in one workflow.',
      'Manager assigned jobs by availability in real time.',
      'Front desk answered customer questions in seconds.'
    ],
    results: [
      'Monthly car throughput up 16%',
      'Parts stock errors down 37%',
      'Front desk response time down 45%'
    ],
    quote:
      'We are not a tech-heavy shop, but GARIXO was easy for everyone. It removed confusion from our day-to-day work.',
    ownerName: 'Daniel Ortiz'
  },
  {
    slug: 'north-bay-garage-ca',
    garageName: 'North Bay Garage',
    city: 'San Jose',
    state: 'California',
    yearsInBusiness: 18,
    technicians: 10,
    monthlyCars: 520,
    before: [
      'Team had no single view of jobs waiting for approval.',
      'Completed jobs sometimes waited too long for payment.',
      'Owner had limited visibility when away from the shop.'
    ],
    after: [
      'Live board highlighted waiting approvals and pickup-ready jobs.',
      'Service team followed one clear status flow.',
      'Owner monitored operations remotely from one dashboard.'
    ],
    results: [
      'Cash collection speed up 24%',
      'Ready-for-pickup delays down 31%',
      'Owner reporting time down 60%'
    ],
    quote:
      'GARIXO helped us run a cleaner operation without adding complexity. My staff adopted it quickly and customers noticed the difference.',
    ownerName: 'Susan Park'
  }
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((item) => item.slug === slug);
}
