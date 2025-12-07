'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Calendar, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Trophy className="w-20 h-20 text-orange-500" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Basketball Weihnachtsturnier 2024
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Willkommen zum größten Basketball-Event des Jahres!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="text-2xl">U10 / U12 Turnier</CardTitle>
              <CardDescription className="text-blue-100">
                Jüngere Altersklassen
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/tournament/u12">
                  <Button className="w-full" size="lg">
                    Turnier ansehen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-200">
            <CardHeader className="bg-red-600 text-white">
              <CardTitle className="text-2xl">U14 / U16 Turnier</CardTitle>
              <CardDescription className="text-red-100">
                Ältere Altersklassen
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Link href="/tournament/u14">
                  <Button className="w-full" size="lg" variant="destructive">
                    Turnier ansehen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Spielplan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Alle Spiele und Termine im Überblick
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="w-10 h-10 text-orange-500 mb-2" />
              <CardTitle>Tabelle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aktuelle Platzierungen und Statistiken
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-red-600 mb-2" />
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Alle teilnehmenden Mannschaften
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/login">
            <Button variant="outline" size="lg">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
