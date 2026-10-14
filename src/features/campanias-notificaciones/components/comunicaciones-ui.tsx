import React from 'react';
import { Pressable, Text, TextInput, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {colors} from '../../../constants/theme';
export type IconName=React.ComponentProps<typeof Ionicons>['name'];
export function Boton({texto,icono,onPress,secundario=false,peligro=false,disabled=false}: {
 texto:string;icono?:IconName;onPress:()=>void;secundario?:boolean;peligro?:boolean;disabled?:boolean;
}){
 const fg=secundario?colors.primary:'#FFFFFF';
 return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.boton,secundario&&styles.secundario,peligro&&{backgroundColor:colors.danger,borderColor:colors.danger},disabled&&{opacity:.45}]}>
 {icono?<Ionicons name={icono} size={16} color={fg}/>:null}<Text style={{color:fg,fontWeight:'700',fontSize:13}}>{texto}</Text></Pressable>;
}
export function Campo({etiqueta,value,onChangeText,placeholder,lines=1,editable=true,keyboardType='default'}:{etiqueta:string;value:string;onChangeText:(v:string)=>void;placeholder?:string;lines?:number;editable?:boolean;keyboardType?:'default'|'numeric'}){
 return <View style={{gap:6,flex:1,minWidth:190}}><Text style={styles.etiqueta}>{etiqueta}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} editable={editable} keyboardType={keyboardType}
 multiline={lines>1} numberOfLines={lines} textAlignVertical={lines>1?'top':'center'} style={[styles.entrada,lines>1&&{minHeight:110}]} placeholderTextColor="#8A96A7"/></View>;
}
export function Chip({texto,activo,onPress,disabled=false}:{texto:string;activo:boolean;onPress:()=>void;disabled?:boolean}){
 return <Pressable accessibilityRole="button" accessibilityState={{selected:activo}} disabled={disabled} onPress={onPress} style={[styles.chip,activo&&styles.chipActivo,disabled&&{opacity:.4}]}>
 <Text numberOfLines={1} style={[styles.chipTexto,activo&&{color:'#FFFFFF'}]}>{texto}</Text></Pressable>;
}
export function Aviso({mensaje,exito=false}:{mensaje:string|null;exito?:boolean}){
 if(!mensaje)return null;
 return <View style={[styles.aviso,{backgroundColor:exito?colors.successLight:colors.dangerLight}]}><Ionicons name={exito?'checkmark-circle-outline':'alert-circle-outline'} size={18} color={exito?colors.success:colors.danger}/><Text style={{flex:1,color:exito?colors.success:colors.danger,fontSize:13,lineHeight:19}}>{mensaje}</Text></View>;
}
export function Bloque({titulo,children}:{titulo:string;children:React.ReactNode}){
 return <View style={styles.bloque}><Text style={{fontWeight:'800',color:colors.text,fontSize:19}}>{titulo}</Text>{children}</View>;
}
export const ui=StyleSheet.create({
 fila:{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:10},etiqueta:{fontSize:12,color:colors.muted,fontWeight:'700'},
 boton:{backgroundColor:colors.primary,borderWidth:1,borderColor:colors.primary,borderRadius:10,paddingVertical:11,paddingHorizontal:13,flexDirection:'row',gap:7,alignItems:'center',justifyContent:'center'},
 secundario:{backgroundColor:'#FFFFFF',borderColor:colors.border},
 entrada:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:colors.border,borderRadius:10,color:colors.text,fontSize:14,padding:12,minHeight:46},
 chip:{borderWidth:1,borderColor:colors.border,borderRadius:9,paddingVertical:11,paddingHorizontal:13,backgroundColor:'#FFFFFF',maxWidth:'100%'},
 chipActivo:{backgroundColor:colors.primary,borderColor:colors.primary},chipTexto:{color:colors.text,fontSize:12,fontWeight:'600'},
 aviso:{padding:12,borderRadius:10,flexDirection:'row',gap:8,alignItems:'flex-start'},
 bloque:{backgroundColor:'#FFFFFF',borderWidth:1,borderColor:colors.border,borderRadius:15,padding:20,gap:18},
 titulo:{fontWeight:'800',color:colors.text,fontSize:17},muted:{color:colors.muted,fontSize:13,lineHeight:20},
});
const styles=ui;
