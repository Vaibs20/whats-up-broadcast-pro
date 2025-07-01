import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { MessageSquare, Users, Zap, Shield, ArrowRight, BarChart3, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
    const { isAuthenticated } = useAuth();

    // Redirect to dashboard if user is authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">WhatsApp Business</h2>
                            <p className="text-sm text-gray-500">API Client</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-green-600 text-white hover:bg-green-700">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        Broadcast WhatsApp Messages at Scale
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Streamline your business communication with our powerful WhatsApp Business API platform.
                        Manage contacts, automate messages, and track performance effortlessly.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 gap-2">
                                Start for Free
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-100">
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Comprehensive WhatsApp Business Solutions
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MessageCircle,
                                title: "Bulk Messaging",
                                description: "Send personalized messages to thousands of contacts with just a few clicks."
                            },
                            {
                                icon: Users,
                                title: "Contact Management",
                                description: "Organize and segment your contacts into targeted groups for better reach."
                            },
                            {
                                icon: BarChart3,
                                title: "Analytics Dashboard",
                                description: "Track message delivery, engagement rates, and campaign performance."
                            },
                            {
                                icon: Zap,
                                title: "Automation",
                                description: "Schedule messages and set up automated responses for better engagement."
                            },
                            {
                                icon: Shield,
                                title: "Secure & Compliant",
                                description: "Enterprise-grade security with WhatsApp Business API compliance."
                            },
                            {
                                icon: MessageSquare,
                                title: "Template Messages",
                                description: "Create and manage pre-approved message templates for quick sending."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of businesses already using our WhatsApp Business API platform
                    </p>
                    <Link to="/signup">
                        <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 gap-2">
                            Create Free Account
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-gray-900">WhatsApp Business</h2>
                                <p className="text-sm text-gray-500">API Client</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            © {new Date().getFullYear()} WhatsApp Business API Client. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}