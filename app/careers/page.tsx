// Create this file: app/careers/page.tsx

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  BriefcaseIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  HeartIcon,
  LightBulbIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "Careers - Edmich Autoplux",
  description:
    "Join our team and help revolutionize the auto parts industry in Nigeria.",
};

export default function CareersPage() {
  const values = [
    {
      icon: RocketLaunchIcon,
      title: "Innovation",
      description:
        "We're always pushing boundaries and finding new ways to serve our customers better.",
    },
    {
      icon: UserGroupIcon,
      title: "Collaboration",
      description:
        "Great things happen when talented people work together towards a common goal.",
    },
    {
      icon: HeartIcon,
      title: "Customer First",
      description:
        "Every decision we make is guided by what's best for our customers.",
    },
    {
      icon: LightBulbIcon,
      title: "Continuous Learning",
      description:
        "We invest in our team's growth and encourage learning new skills.",
    },
  ];

  const jobs = [
    {
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description:
        "We're looking for a talented full-stack developer to help build and scale our platform.",
      requirements: [
        "3+ years of experience with React and Next.js",
        "Strong understanding of RESTful APIs",
        "Experience with PostgreSQL or similar databases",
        "Knowledge of cloud platforms (Vercel, AWS, etc.)",
      ],
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description:
        "Join us as a Product Manager to drive our product strategy.",
      requirements: [
        "4+ years of product management experience",
        "Experience in e-commerce or marketplace platforms",
        "Strong analytical and problem-solving skills",
        "Excellent communication abilities",
      ],
    },
  ];

  const benefits = [
    "Competitive salary",
    "Health insurance",
    "Flexible work hours",
    "Remote work options",
    "Professional development",
    "Team outings & events",
    "Modern office space",
    "Growth opportunities",
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        {/* Hero */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <BriefcaseIcon className="h-20 w-20 mx-auto mb-6 opacity-90" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Help us revolutionize the auto parts industry in Nigeria
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:shadow-xl transition-all text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gradient-to-br from-neutral-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">
              Why Join Edmich?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 border-2 border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <p className="font-semibold text-neutral-900">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs */}
        <section className="py-16 max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">
            Open Positions
          </h2>
          <div className="space-y-6">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-neutral-900">
                        {job.title}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {job.department}
                      </span>
                    </div>
                    <div className="flex gap-4 mb-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        {job.type}
                      </span>
                    </div>
                    <p className="text-neutral-700 mb-4">{job.description}</p>
                    <ul className="space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex gap-2 text-neutral-600">
                          <span className="text-blue-600">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={`mailto:careers@edmichautoplux.com?subject=Application for ${job.title}`}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all text-center"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <GlobeAltIcon className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Don't See a Perfect Match?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Send us your resume and tell us how you can contribute!
            </p>
            <a
              href="mailto:careers@edmichautoplux.com"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-2xl transition-all"
            >
              Send Your Resume
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
