import { useAppStore } from "@/store/useAppStore";
import { translateLevel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, AlertCircle, Plus, User, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Analytics() {
  const { userRole, students, assignments, addAssignment, completeAssignment, currentUser } = useAppStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const triggerRemediation = (studentId: number, studentName: string) => {
    addAssignment("Fuzzy Qayta o'rganish: Asoslarni mustahkamlash", studentId, 1);
    toast({
      title: "Qayta o'rganish (Soddalashtirilgan)",
      description: `${studentName} uchun asosiy tushunchalar moduli biriktirildi.`,
    });
  };

  const triggerFastForward = (studentId: number, studentName: string) => {
    addAssignment("Fuzzy O'tish: Murakkab himoya tizimlari", studentId, 4);
    toast({
      title: "O'tish qarori", 
      description: `${studentName} muvaffaqiyatli o'tgani uchun murakkab modulga yo'naltirildi.`,
    });
  };

  // Filter assignments for active user (currentUser.id ishlatiladi, hardcoded 99 emas!)
  const studentAssignments = assignments.filter(a => a.studentId === currentUser?.id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black font-mono">Tizim Tahlili & Analitika</h1>
        <p className="text-muted-foreground mt-1">
          {userRole === "Teacher" 
            ? "Guruh o'quvchilarining ko'rsatkichlari va moslashuvchan o'quv traektoriyalarini boshqarish." 
            : "Sizning shaxsiy o'quv natijalaringiz va o'qituvchi topshiriqlari."}
        </p>
      </div>

      {userRole === "Teacher" ? (
        /* TEACHER ANALYTICS VIEW */
        <div className="space-y-8">
          {/* Class Metrics */}
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="text-xs font-bold font-mono text-muted-foreground uppercase">Guruh o'rtacha ko'rsatkichi</div>
                <div className="text-3xl font-bold font-mono mt-2 text-black">
                  {(students.reduce((acc, s) => acc + s.fuzzyScore, 0) / students.length * 100).toFixed(0)}%
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">ANFIS baholash bo'yicha</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="text-xs font-bold font-mono text-muted-foreground uppercase">Faol o'quvchilar</div>
                <div className="text-3xl font-bold font-mono mt-2 text-black">{students.length} nafar</div>
                <p className="text-[11px] text-muted-foreground mt-1">Hozirda tizimda ro'yxatdan o'tgan</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-white">
              <CardContent className="p-6">
                <div className="text-xs font-bold font-mono text-muted-foreground uppercase">Biriktirilgan topshiriqlar</div>
                <div className="text-3xl font-bold font-mono mt-2 text-black">{assignments.length} ta</div>
                <p className="text-[11px] text-muted-foreground mt-1">O'qituvchi tomonidan yuborilgan</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card className="border-border/60 bg-white">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-lg font-bold font-mono">Guruhdagi o'quvchilar ko'rsatkichlari</CardTitle>
              <CardDescription>
                Har bir o'quvchining diagnostic test va fuzzy baholash natijalari
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-[#f8f9fa] font-mono text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 font-semibold">O'quvchi</th>
                    <th className="p-4 font-semibold">Yosh</th>
                    <th className="p-4 font-semibold">Test (Diagnostic)</th>
                    <th className="p-4 font-semibold">Tayyorgarlik (Fuzzy)</th>
                    <th className="p-4 font-semibold">Daraja</th>
                    <th className="p-4 font-semibold">Xatolar / Tezlik</th>
                    <th className="p-4 font-semibold text-center">Fuzzy Adaptatsiya Qarori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-black">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-[#fcfcfc] transition-colors">
                      <td className="p-4 font-bold flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {student.name}
                      </td>
                      <td className="p-4 font-mono">{student.age} yosh</td>
                      <td className="p-4 font-mono">{(student.diagnosticScore * 100).toFixed(0)}%</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span>{(student.fuzzyScore * 100).toFixed(0)}%</span>
                          <Progress value={student.fuzzyScore * 100} className="w-16 h-1.5 [&>div]:bg-black" />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          student.level === "Advanced" ? "bg-black text-white" :
                          student.level === "Intermediate" ? "bg-[#e9ecef] text-black" :
                          "bg-[#f1f3f5] text-muted-foreground"
                        }`}>
                          {translateLevel(student.level)}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">
                        {student.errors * 10} xato / {student.speed * 20} soniya
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerRemediation(student.id, student.name)}
                            className="text-[10px] h-7 font-mono text-muted-foreground border-border/80"
                          >
                            Qayta o'rganish
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => triggerFastForward(student.id, student.name)}
                            className="text-[10px] h-7 font-mono bg-black text-white hover:bg-black/90"
                          >
                            O'tish
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Link to Assignments page */}
          <Card className="border-dashed border-2 border-border/40 bg-white/50">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-sm font-mono text-black">Topshiriq yuklash</h4>
                <p className="text-xs text-muted-foreground">
                  O'quvchiga yangi vazifa va savollar biriktirish uchun "Topshiriqlar" bo'limiga o'ting.
                </p>
              </div>
              <Button
                onClick={() => setLocation("/assignments")}
                className="bg-black text-white hover:bg-black/90 font-mono text-xs shrink-0 ml-4"
              >
                <Plus className="w-4 h-4 mr-2" /> Topshiriq qo'shish
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* STUDENT ANALYTICS VIEW */
        <div className="grid md:grid-cols-3 gap-8">
          {/* Student Progress Stats */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/60 bg-white">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-md font-bold font-mono flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-black" />
                  Shaxsiy Fuzzy Tahlilingiz
                </CardTitle>
                <CardDescription>Real-vaqtda ANFIS baholash moduli natijalari</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Score */}
                <div className="flex items-center justify-between border-b border-border/20 pb-4">
                  <div>
                    <h4 className="font-bold text-sm text-black">Hozirgi tayyorgarlik darajangiz</h4>
                    <p className="text-xs text-muted-foreground">Fuzzy qoidalar bo'yicha yakuniy ko'rsatkich</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-black">
                      {(useAppStore.getState().readinessScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Progress parameters */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[#f8f9fa] p-3 rounded-lg border border-border/30">
                    <div className="text-[10px] font-bold font-mono text-muted-foreground uppercase">Bilim darajasi</div>
                    <div className="text-sm font-bold font-mono text-black mt-1">
                      {(useAppStore.getState().fuzzyMetrics.knowledge * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-[#f8f9fa] p-3 rounded-lg border border-border/30">
                    <div className="text-[10px] font-bold font-mono text-muted-foreground uppercase">Bajarish tezligi</div>
                    <div className="text-sm font-bold font-mono text-black mt-1">
                      {(100 - useAppStore.getState().fuzzyMetrics.speed * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-[#f8f9fa] p-3 rounded-lg border border-border/30">
                    <div className="text-[10px] font-bold font-mono text-muted-foreground uppercase">Xatolik darajasi</div>
                    <div className="text-sm font-bold font-mono text-black mt-1">
                      {(useAppStore.getState().fuzzyMetrics.errors * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs leading-relaxed text-muted-foreground">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <p>
                      Sizning ko'rsatkichlaringiz o'qituvchi belgilagan qoidalar asosida moslashuvchan o'qitish tizimiga yuboriladi va yo'nalishingiz dinamik tahrirlab boriladi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teacher Assignments list for active student */}
          <div className="space-y-6">
            <Card className="border-border/60 bg-white">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-md font-bold font-mono flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-black" />
                  O'qituvchi Topshiriqlari
                </CardTitle>
                <CardDescription>Sizga biriktirilgan individual o'quv vazifalari</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {studentAssignments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    Sizga hozircha topshiriqlar biriktirilmagan.
                  </div>
                ) : (
                  studentAssignments.map(as => (
                    <div key={as.id} className="p-3 border border-border/40 rounded-lg bg-white space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-black leading-snug">{as.title}</span>
                          {as.completed ? (
                            <span className="bg-[#e9ecef] text-black font-mono text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">Bajarildi</span>
                          ) : (
                            <span className="bg-black text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0">Ochilgan</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">Belgilangan sana: {as.dateAssigned}</div>
                      </div>
                      {!as.completed && (
                        <Button 
                          onClick={() => {
                            completeAssignment(as.id);
                            toast({
                              title: "Topshiriq bajarildi",
                              description: "Tabriklaymiz! Topshiriq muvaffaqiyatli yakunlandi.",
                            });
                          }}
                          className="w-full text-[10px] h-7 bg-black text-white hover:bg-black/90 font-mono font-bold mt-1"
                        >
                          Bajarish (Modulga o'tish)
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
