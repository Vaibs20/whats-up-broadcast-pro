import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MessageSquare, Users, Zap, Shield, ArrowRight, Smartphone, Globe2 } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl">WhatsApp Business API Client</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-green-600 hover:text-green-700">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                        WhatsApp Business API Client
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Enterprise-grade solution for managing WhatsApp Business communications at scale.
                        Automate messages, handle customer interactions, and track performance seamlessly.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                                Start Free Trial
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white/50 backdrop-blur-sm border-y">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Enterprise Features for WhatsApp Business
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MessageSquare,
                                title: "Bulk Messaging",
                                description: "Send personalized messages to thousands of contacts with advanced templating and scheduling."
                            },
                            {
                                icon: Users,
                                title: "Contact Management",
                                description: "Organize contacts into groups, segments, and lists for targeted communications."
                            },
                            {
                                icon: Zap,
                                title: "Automation & Webhooks",
                                description: "Set up automated responses and integrate with your existing business systems."
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Security",
                                description: "Bank-grade encryption and compliance with WhatsApp Business API policies."
                            },
                            {
                                icon: Smartphone,
                                title: "Multi-Device Support",
                                description: "Manage communications across multiple devices and team members seamlessly."
                            }
                        ].map((feature, index) => (
                            <Card key={index} className="p-6 border-green-100 bg-white/80">
                                <feature.icon className="w-12 h-12 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Business?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join enterprises worldwide using our WhatsApp Business API solution
                    </p>
                    <Link to="/signup">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
                            Start Your Free Trial
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-sm border-t">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold">WhatsApp Business API Client</span>
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