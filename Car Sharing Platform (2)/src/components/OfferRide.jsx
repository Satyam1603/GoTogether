import { ArrowLeft, Car, DollarSign, Users, Shield, Clock, TrendingUp, CheckCircle, ArrowRight, MapPin, Calendar, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function OfferRide({ onNavigate, user }) {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Save Money',
      description: 'Share your fuel costs and turn your empty seats into extra income',
    },
    {
      icon: Users,
      title: 'Meet People',
      description: 'Connect with fellow travelers and make your journey more enjoyable',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified profiles, ratings, and secure payment system for peace of mind',
    },
    {
      icon: TrendingUp,
      title: 'Easy to Use',
      description: 'Post your ride in minutes and manage bookings with our simple platform',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Plan Your Trip',
      description: 'Decide when and where you\'re going and how many seats you can offer',
      icon: MapPin,
    },
    {
      step: 2,
      title: 'Publish Your Ride',
      description: 'Create your ride listing with all the details about your journey',
      icon: Calendar,
    },
    {
      step: 3,
      title: 'Accept Bookings',
      description: 'Review passenger requests and approve the ones that work for you',
      icon: Users,
    },
    {
      step: 4,
      title: 'Hit the Road',
      description: 'Pick up your passengers and enjoy the journey together',
      icon: Car,
    },
  ];

  const requirements = [
    'Valid driver\'s license',
    'Insured vehicle in good condition',
    'At least 2 years of driving experience',
    'Clean driving record',
    'Age 21 or older',
    'Verified phone number and email',
  ];

  const tips = [
    {
      title: 'Set the Right Price',
      description: 'Keep prices competitive to attract more passengers. Consider fuel costs, distance, and tolls.',
    },
    {
      title: 'Be Clear About Pickup Points',
      description: 'Choose convenient and easy-to-find locations for passenger pickup and dropoff.',
    },
    {
      title: 'Communicate Effectively',
      description: 'Respond promptly to booking requests and keep passengers updated about any changes.',
    },
    {
      title: 'Be Flexible',
      description: 'Being open to slight route adjustments can help you fill more seats.',
    },
  ];

  const stats = [
    { label: 'Active Drivers', value: '50,000+' },
    { label: 'Average Rating', value: '4.8/5' },
    { label: 'Monthly Earnings', value: '$300+' },
    { label: 'Rides Completed', value: '1M+' },
  ];

  const handleGetStarted = () => {
    if (user) {
      onNavigate('postride');
    } else {
      onNavigate('postride');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl mb-4">Turn Your Commute Into Cash</h1>
              <p className="text-xl text-blue-100 mb-8">
                Drive with passengers going your way and share travel costs. It's easy, safe, and rewarding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={handleGetStarted}
                >
                  {user ? 'Publish Your First Ride' : 'Sign Up to Get Started'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => {
                    const section = document.getElementById('how-it-works');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn How It Works
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
                  <div className="text-3xl mb-2">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Why Offer Rides with GoTogether?</h2>
          <p className="text-xl text-gray-600">Join thousands of drivers who are making their journeys more profitable</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Four simple steps to start earning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-0 hidden lg:block" 
                       style={{ display: index === howItWorks.length - 1 ? 'none' : 'block' }}>
                  </div>
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={handleGetStarted}>
              {user ? 'Post Your Ride Now' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl mb-6">Driver Requirements</h2>
            <p className="text-xl text-gray-600 mb-8">
              To ensure safety and quality for all our users, we ask that drivers meet the following requirements:
            </p>
            <div className="space-y-3">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{requirement}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-4xl mb-6">Tips for Success</h2>
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <Card key={index} className="p-6">
                  <h3 className="text-xl mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">What Drivers Are Saying</h2>
            <p className="text-xl text-gray-600">Real experiences from our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "I commute to work every day, and GoTogether has turned my daily drive into extra income. I've met some great people too!"
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center">
                  S
                </div>
                <div>
                  <div>Sarah M.</div>
                  <div className="text-sm text-gray-500">Driver since 2024</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The platform is super easy to use. I can post my rides in minutes and the booking system works perfectly."
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center">
                  M
                </div>
                <div>
                  <div>Michael T.</div>
                  <div className="text-sm text-gray-500">Driver since 2023</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "I love that I can choose who rides with me. The verification system makes me feel safe and secure."
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center">
                  E
                </div>
                <div>
                  <div>Emily R.</div>
                  <div className="text-sm text-gray-500">Driver since 2024</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl mb-4">Ready to Start Earning?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of drivers and start making your commute more profitable today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={handleGetStarted}
            >
              {user ? 'Publish Your Ride' : 'Sign Up Now'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-blue-100 mt-6">
            No sign-up fees • No monthly charges • You set your own prices
          </p>
        </div>
      </div>
    </div>
  );
}
