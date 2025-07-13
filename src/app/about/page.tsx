"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Heart, 
  Users, 
  Award, 
  Globe, 
  Palette, 
  Star, 
  ShoppingBag,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Founder & Creative Director",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "A passionate jewelry designer with 15+ years of experience in beadwork and sustainable fashion.",
      specialties: ["Bead Weaving", "Design", "Sustainability"]
    },
    {
      name: "Marcus Rodriguez",
      role: "Master Craftsman",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Specializes in intricate bead patterns and traditional techniques from around the world.",
      specialties: ["Traditional Techniques", "Quality Control", "Mentoring"]
    },
    {
      name: "Aisha Patel",
      role: "Customer Experience Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Ensures every customer feels valued and finds their perfect piece of jewelry.",
      specialties: ["Customer Service", "Personal Styling", "Community Building"]
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Handcrafted with Love",
      description: "Every piece is carefully crafted by hand, ensuring unique quality and attention to detail."
    },
    {
      icon: Globe,
      title: "Sustainable Practices",
      description: "We source eco-friendly materials and use sustainable packaging to protect our planet."
    },
    {
      icon: Sparkles,
      title: "Creative Excellence",
      description: "Pushing the boundaries of beadwork with innovative designs and techniques."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a community of bead enthusiasts and supporting local artisans worldwide."
    }
  ];

  const stats = [
    { number: "5000+", label: "Happy Customers" },
    { number: "15+", label: "Years of Experience" },
    { number: "50+", label: "Countries Served" },
    { number: "100%", label: "Handcrafted" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Since 2009
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From a small craft room to a global community of bead enthusiasts, 
              Star Beads Kreation has been weaving dreams into reality, one bead at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At Star Beads Kreation, we believe that jewelry is more than just adornment—it's a form of self-expression, 
                a connection to culture, and a celebration of creativity. Our mission is to bring the world's most beautiful 
                beads and finest craftsmanship to your fingertips.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We work directly with artisans from around the globe, ensuring fair trade practices and supporting 
                traditional beadwork techniques while embracing modern innovation.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Explore Our Collection
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    <Mail className="w-4 h-4 mr-2" />
                    Get in Touch
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image 
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop"
                alt="Beadwork in progress"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Award-Winning Craftsmanship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">
              The passionate artisans and experts behind Star Beads Kreation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="relative mb-4">
                    <Image 
                      src={member.image}
                      alt={member.name}
                      width={200}
                      height={200}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
                alt="Our workshop"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -top-6 -right-6 bg-background p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold">Creative Workshop</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">The Journey Begins</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                It all started in 2009 when Sarah Chen discovered her passion for beadwork while traveling through 
                Southeast Asia. Fascinated by the intricate patterns and cultural significance of traditional beadwork, 
                she began learning from local artisans.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                What began as a personal hobby quickly grew into a mission to preserve and share these beautiful 
                traditions with the world. Today, Star Beads Kreation works with over 50 artisans from 15 countries, 
                bringing you the finest beads and most exquisite designs.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full border-2 border-background"></div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Join 5000+ happy customers worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Bead Journey?</h2>
          <p className="text-lg mb-8 opacity-90">
            Whether you're a seasoned collector or just discovering the world of beads, 
            we're here to help you find your perfect piece.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" asChild>
              <Link href="/products">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Now
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  hello@starbeadskreation.com
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  San Francisco, CA
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/products" className="block text-muted-foreground hover:text-foreground">Products</Link>
                <Link href="/categories" className="block text-muted-foreground hover:text-foreground">Categories</Link>
                <Link href="/gallery" className="block text-muted-foreground hover:text-foreground">Gallery</Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
