import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'operator' | 'requester';
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      
      // Get user profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Gerenciamento de Manutenção</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {profile?.full_name || user?.email}
              {profile && (
                <Badge variant="secondary" className="ml-2">
                  {profile.user_type === 'admin' ? 'Administrador' : 
                   profile.user_type === 'operator' ? 'Operador' : 'Requisitante'}
                </Badge>
              )}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Work Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription>Gerenciar ordens de manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/work-orders")}
                >
                  Ver Ordens de Serviço
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/work-orders/new")}
                >
                  Nova Ordem de Serviço
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backlog */}
          <Card>
            <CardHeader>
              <CardTitle>Backlog</CardTitle>
              <CardDescription>Acompanhar status das ordens</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate("/backlog")}
              >
                Ver Backlog
              </Button>
            </CardContent>
          </Card>

          {/* Machines */}
          <Card>
            <CardHeader>
              <CardTitle>Máquinas</CardTitle>
              <CardDescription>Cadastro de equipamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => navigate("/machines")}
                >
                  Gerenciar Máquinas
                </Button>
                {(profile?.user_type === 'admin' || profile?.user_type === 'operator') && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/machines/new")}
                  >
                    Cadastrar Máquina
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personnel */}
          {profile?.user_type === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Pessoal</CardTitle>
                <CardDescription>Gerenciar técnicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate("/personnel")}
                  >
                    Gerenciar Pessoal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/personnel/new")}
                  >
                    Cadastrar Técnico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requesters */}
          {(profile?.user_type === 'admin' || profile?.user_type === 'operator') && (
            <Card>
              <CardHeader>
                <CardTitle>Requisitantes</CardTitle>
                <CardDescription>Cadastro de requisitantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => navigate("/requesters")}
                  >
                    Gerenciar Requisitantes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/requesters/new")}
                  >
                    Cadastrar Requisitante
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
              <CardDescription>MTTR, MTBF e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate("/metrics")}
              >
                Ver Métricas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;